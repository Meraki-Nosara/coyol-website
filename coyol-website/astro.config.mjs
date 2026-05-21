import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://coyolrealestate.com',
  output: 'server',
  adapter: vercel(),
  vite: {
    server: {
      allowedHosts: ['localhost', '.trycloudflare.com'],
    },
  },
});
