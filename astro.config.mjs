import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://dpatelconstruction.com',
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [sitemap()],
});

