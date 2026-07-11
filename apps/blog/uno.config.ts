import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind3,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local';

export default defineConfig({
  shortcuts: [
    ['flex-center', 'flex justify-center items-center'],
    ['flex-col-center', 'flex flex-col justify-center items-center'],
    [
      'btn',
      'px-4 py-1 rounded inline-block bg-primary text-white cursor-pointer hover:opacity-90 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50 transition-opacity',
    ],
    [
      'icon-btn',
      'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-primary-text',
    ],
    ['card', 'bg-base-bg border border-base-border rounded-lg shadow-sm'],
    ['text-default', 'text-[var(--c-text)]'],
    ['text-muted', 'text-[var(--c-text-light)]'],
    ['border-base', 'border-base-border'],
  ],
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: process.env.NODE_ENV === 'development',
    }),
    presetTypography({
      cssExtend: {
        'ul > li::marker': {
          color: 'var(--c-text-light)',
        },
        'ol > li::marker': {
          color: 'var(--c-text-light)',
        },
        a: {
          'text-decoration': 'none',
          'font-weight': '500',
          color: 'var(--c-primary)',
        },
        'a:hover': {
          'text-decoration': 'underline',
        },
        'strong a, b a, a strong, a b': {
          'font-weight': '700',
        },
        '.anchor-link': {
          position: 'absolute',
          left: '-1em',
          'padding-right': '0.5em',
          opacity: '0',
          'text-decoration': 'none !important',
          border: 'none !important',
          color: 'var(--c-text-light)',
          transition: 'opacity 0.2s',
        },
        'h1:hover .anchor-link, h2:hover .anchor-link, h3:hover .anchor-link, h4:hover .anchor-link, h5:hover .anchor-link, h6:hover .anchor-link':
          {
            opacity: '1',
          },
        blockquote: {
          'font-style': 'normal',
          'font-weight': '400',
          'border-left': '0.25em solid var(--c-border)',
          color: 'var(--c-text-light)',
        },
        'blockquote strong, blockquote b': {
          'font-weight': '700',
        },
        'blockquote p:first-of-type::before': {
          content: 'none',
        },
        'blockquote p:last-of-type::after': {
          content: 'none',
        },
        'h1, h2, h3, h4, h5, h6': {
          position: 'relative',
          'font-weight': '600',
          'line-height': '1.3',
          color: 'var(--c-text)',
        },
        'h1, h2': {
          'border-bottom': '1px solid var(--c-border)',
          'padding-bottom': '0.3em',
        },
        hr: {
          'border-color': 'var(--c-border)',
        },
        img: {
          'border-radius': '0.5rem',
          margin: '1.5em auto',
          'box-shadow':
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        table: {
          display: 'block',
          width: '100%',
          'overflow-x': 'auto',
          'border-spacing': '0',
          'border-collapse': 'collapse',
        },
        'tr:nth-child(2n)': {
          'background-color': 'var(--c-fill-subtle)',
        },
        'tr:first-child td': {
          'border-top': '1px solid var(--c-border)',
        },
        th: {
          border: '1px solid var(--c-border)',
          padding: '0.6em 1em',
          'font-weight': '600',
          'background-color': 'var(--c-fill-subtle)',
        },
        td: {
          border: '1px solid var(--c-border)',
          padding: '0.6em 1em',
        },
        // 使用更具体的选择器来覆盖默认样式，而不需要 !important
        '.prose pre': {
          margin: '0',
          padding: '0',
          'background-color': 'transparent',
          'border-radius': '0',
        },
        '.prose pre code': {
          'background-color': 'transparent',
          padding: '0',
          'font-family': 'inherit',
          'font-size': 'inherit',
        },
        '.prose code': {
          'background-color': 'var(--c-fill-subtle)',
          padding: '0.2em 0.4em',
          'border-radius': '0.3em',
          'font-size': '0.9em',
          'font-weight': '400',
        },
        'code::before': { content: 'none' },
        'code::after': { content: 'none' },
        // Task Lists Support
        '.contains-task-list': {
          'list-style-type': 'none',
          'padding-left': '0',
        },
        '.task-list-item': {
          position: 'relative',
          'padding-left': '1.5em',
        },
        '.task-list-item input[type="checkbox"]': {
          position: 'absolute',
          left: '0',
          top: '0.3em',
          margin: '0',
          appearance: 'none',
          width: '1.1em',
          height: '1.1em',
          border: '1px solid var(--c-border)',
          'border-radius': '0.25em',
          'background-color': 'var(--c-bg)',
          cursor: 'pointer',
        },
        '.task-list-item input[type="checkbox"]:checked': {
          'background-color': 'var(--c-primary)',
          'border-color': 'var(--c-primary)',
          'background-image':
            "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")",
          'background-size': '100% 100%',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
        },
      },
    }),
    presetWebFonts({
      fonts: {
        sans: [
          {
            name: 'Inter',
            weights: ['400', '600', '700'],
          },
          {
            name: 'ui-sans-serif',
            provider: 'none',
          },
          {
            name: 'system-ui',
            provider: 'none',
          },
          {
            name: 'PingFang SC',
            provider: 'none',
          },
          {
            name: 'Microsoft YaHei',
            provider: 'none',
          },
          {
            name: 'sans-serif',
            provider: 'none',
          },
        ],
        mono: [
          {
            name: 'JetBrains Mono',
            weights: ['400', '600'],
          },
          {
            name: 'DM Mono',
            weights: ['400'],
          },
        ],
      },
      processors: createLocalFontProcessor({
        // 缓存目录
        cacheDir: 'node_modules/.cache/unocss/fonts',
        // 字体文件存放目录 (Astro 的静态资源目录)
        fontAssetsDir: 'public/fonts',
        // 浏览器访问时的基准路径
        fontServeBaseUrl: '/fonts',
      }),
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      primary: {
        DEFAULT: 'rgb(var(--c-primary-rgb))',
        text: 'rgb(var(--c-primary-text-rgb))',
        subtle: 'var(--c-primary-subtle)',
        border: 'var(--c-primary-border)',
        hover: 'var(--c-primary-hover)',
      },
      base: {
        bg: 'rgb(var(--c-bg-rgb))',
        text: 'rgb(var(--c-text-rgb))',
        'text-light': 'rgb(var(--c-text-light-rgb))',
        border: 'rgb(var(--c-border-rgb))',
        fill: 'var(--c-fill-subtle)',
        hover: 'var(--c-fill-hover)',
      },
    },
    animation: {
      keyframes: {
        'fade-in': '{0% {opacity:0;} 100% {opacity:1;}}',
        'zoom-in':
          '{0% {transform:scale(0.95); opacity:0;} 100% {transform:scale(1); opacity:1;}}',
      },
      durations: {
        'fade-in': '0.2s',
        'zoom-in': '0.2s',
      },
      timingFns: {
        'fade-in': 'ease-out',
        'zoom-in': 'ease-out',
      },
    },
  },
});
