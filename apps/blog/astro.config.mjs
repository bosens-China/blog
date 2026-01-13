import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import uno from '@unocss/astro';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.xiaowo.live',
  integrations: [mdx(), sitemap(), react(), uno({ injectReset: true })],
});
