import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import uno from '@unocss/astro';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV, process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  // 从环境变量读取静态网站域名，用于生成正确的 sitemap 和 canonical URL
  site: env.DOGECLOUD_STATIC_DOMAIN,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [mdx(), sitemap(), react(), uno({ injectReset: true })],
  trailingSlash: 'always',
  vite: {
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
        output: {
          manualChunks: {
            'vendor-gsap': ['gsap'],
            'vendor-mermaid': ['mermaid'],
          },
        },
      },
    },
  },
});
