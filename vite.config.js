import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        nba: resolve(__dirname, 'projects/nba-prediction/index.html'),
        healthcare: resolve(__dirname, 'projects/healthcare-pricing/index.html'),
        metriclab: resolve(__dirname, 'projects/metriclab/index.html'),
        soundscout: resolve(__dirname, 'projects/soundscout/index.html'),
      },
    },
  },
})
