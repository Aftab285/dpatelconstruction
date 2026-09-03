import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://dpatelconstruction.com',
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [sitemap()],
});

