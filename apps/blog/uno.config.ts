import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

export default defineConfig({
  content: {
    pipeline: {
      // 除默认文件类型外，还需扫描 src 下的 ts 文件（如 markdown 插件中拼接的 HTML 类名）
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        /src\/.*\.ts($|\?)/,
      ],
    },
  },
  shortcuts: [
    ['flex-center', 'flex justify-center items-center'],
    ['flex-col-center', 'flex flex-col justify-center items-center'],
    ['text-muted', 'text-[var(--c-text-light)]'],
    // 文字链接：默认浅灰，悬停变深，不加下划线和背景
    [
      'link-muted',
      'text-base-text-light hover:text-base-text transition-colors',
    ],
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
        hr: {
          'border-color': 'var(--c-border)',
        },
        // 中文正文需要比英文更松的行距
        'p, li': {
          'line-height': '1.8',
        },
        img: {
          'border-radius': '0.5rem',
          margin: '1.5em auto',
        },
        // 正文中原样保留的 <video> 与 iframe 嵌入
        'video, iframe': {
          display: 'block',
          width: '100%',
          'max-width': '100%',
          margin: '2em 0',
          border: '1px solid var(--c-border)',
          'border-radius': '0.5rem',
        },
        video: {
          'background-color': 'black',
        },
        // 视频平台播放器按 16:9 自适应；音乐外链播放器保留自身高度
        'iframe[src*="bilibili.com"], iframe[src*="youtube.com"], iframe[src*="v.qq.com"]':
          {
            height: 'auto',
            'aspect-ratio': '16 / 9',
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
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    // 使用系统字体栈，不加载任何网络字体
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
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
