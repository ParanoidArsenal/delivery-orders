import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Vite 8 rejects an inline `test` key in its own config, so Vitest gets its own file.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: true,
    },
  }),
)
