import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['flex-center', 'flex justify-center items-center'],
    ['flex-col-center', 'flex flex-col justify-center items-center'],
    ['btn', 'px-4 py-1 rounded inline-block bg-primary text-white cursor-pointer hover:opacity-90 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50 transition-opacity'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-primary'],
    ['card', 'bg-base-bg border border-base-border rounded-lg shadow-sm'],
    ['text-base', 'text-base-text'],
    ['text-light', 'text-base-text-light'],
    ['border-base', 'border-base-border'],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography({
      cssExtend: {
        'a': {
          'text-decoration': 'none',
          'font-weight': '500',
          'color': 'var(--c-primary)',
        },
        'a:hover': {
          'text-decoration': 'underline',
        },
        'blockquote': {
          'font-style': 'normal',
          'font-weight': '400',
          'border-left': '0.25em solid var(--c-border)',
          'color': 'var(--c-text-light)',
        },
        'blockquote p:first-of-type::before': {
          'content': 'none',
        },
        'blockquote p:last-of-type::after': {
          'content': 'none',
        },
        'h1, h2, h3, h4, h5, h6': {
          'font-weight': '600',
          'line-height': '1.3',
          'color': 'var(--c-text)',
        },
        'h1, h2': {
          'border-bottom': '1px solid var(--c-border)',
          'padding-bottom': '0.3em',
        },
        'hr': {
          'border-color': 'var(--c-border)',
        },
        'code': {
          'background-color': 'rgba(128, 128, 128, 0.1)',
          'padding': '0.2em 0.4em',
          'border-radius': '0.3em',
          'font-size': '0.9em',
          'font-weight': '400 !important',
        },
        'code::before': {
          'content': 'none',
        },
        'code::after': {
          'content': 'none',
        },
        'pre': {
          'background-color': 'var(--shiki-bg) !important',
        },
        'pre code': {
          'background-color': 'transparent !important',
          'padding': '0',
        }
      }
    }),
    presetWebFonts({
      fonts: {
        sans: [
          {
            name: 'Inter',
            weights: ['400', '600', '700'],
          },
          {
            name: 'PingFang SC',
            provider: 'none',
          },
          {
            name: 'Hiragino Sans GB',
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
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      primary: 'var(--c-primary)',
      base: {
        bg: 'var(--c-bg)',
        text: 'var(--c-text)',
        'text-light': 'var(--c-text-light)',
        border: 'var(--c-border)',
      }
    }
  }
})
