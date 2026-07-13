import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import { extname, join, relative, sep } from 'node:path'

const root = new URL('../dist/', import.meta.url)
const serverDirectory = new URL('./server/', root)

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory() && entry.name !== 'server') files.push(...await collect(path))
    if (entry.isFile()) files.push(path)
  }
  return files
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
}

const files = await collect(root.pathname)
const assets = {}
for (const file of files) {
  const pathname = `/${relative(root.pathname, file).split(sep).join('/')}`
  assets[pathname] = {
    body: (await readFile(file)).toString('base64'),
    type: mimeTypes[extname(file)] || 'application/octet-stream',
  }
}

const worker = `const assets=${JSON.stringify(assets)};
const decode=(value)=>Uint8Array.from(atob(value),character=>character.charCodeAt(0));
export default{async fetch(request){const url=new URL(request.url);let path=url.pathname;if(path.endsWith('/'))path+='index.html';let asset=assets[path];if(!asset&&path==='/index')asset=assets['/index.html'];if(!asset)return new Response('Not found',{status:404});return new Response(decode(asset.body),{headers:{'content-type':asset.type,'cache-control':asset.type.startsWith('text/html')?'no-cache':'public, max-age=31536000, immutable'}})}};
`

await mkdir(serverDirectory, { recursive: true })
await writeFile(new URL('./index.js', serverDirectory), worker)
