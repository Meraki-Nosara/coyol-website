import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: true,
    port: 4400
  },
  vite: {
    css: {
      postcss: {
        plugins: [
          (await import('tailwindcss')).default
        ]
      }
    }
  }
});
