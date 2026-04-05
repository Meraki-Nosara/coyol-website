import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://coyolrealestate.com',
  vite: {
    server: {
      allowedHosts: ['localhost', '.trycloudflare.com'],
    },
  },
});
