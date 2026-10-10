import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import uno from '@unocss/astro';
import { defineConfig, envField, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV, process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      PUBLIC_BLOG_API_URL: envField.string({
        context: 'client',
        access: 'public',
        url: true,
        default: 'http://localhost:8000',
      }),
    },
  },
  // 从环境变量读取静态网站域名，用于生成正确的 sitemap 和 canonical URL
  site: env.DOGECLOUD_STATIC_DOMAIN,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  // 字体文件从本地 npm 包打包进产物；只有 Windows 的字体栈引用它，其它平台不会下载
  fonts: [
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Noto Sans SC Variable',
      cssVariable: '--font-noto-sans-sc',
      weights: ['100 900'],
      styles: ['normal'],
      // 回退字体由 vars.css 中的完整字体栈负责
      fallbacks: [],
      options: { package: '@fontsource-variable/noto-sans-sc' },
    },
  ],
  integrations: [mdx(), sitemap(), react(), uno({ injectReset: true })],
  trailingSlash: 'always',
  vite: {
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
