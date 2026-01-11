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
    ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600'],
    ['card', 'bg-white dark:bg-hex-121212 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm'],
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
        'h1': {
          'padding-bottom': '0.3em',
          'border-bottom': '1px solid #d0d7de', // GitHub light border
        },
        '.dark h1': {
          'border-bottom-color': '#30363d', // GitHub dark border
        },
        'h2': {
          'padding-bottom': '0.3em',
          'border-bottom': '1px solid #d0d7de',
        },
        '.dark h2': {
          'border-bottom-color': '#30363d',
        },
        'blockquote': {
          'border-left': '4px solid #d0d7de',
          'color': '#57606a',
          'font-style': 'normal',
          'padding-left': '1em',
        },
        '.dark blockquote': {
          'border-left-color': '#30363d',
          'color': '#8b949e',
        },
        'table': {
          'border-collapse': 'collapse',
          'width': '100%',
          'margin-top': '1.5em',
          'margin-bottom': '1.5em',
          'display': 'block',
          'overflow-x': 'auto',
        },
        'th, td': {
          'border': '1px solid #d0d7de',
          'padding': '0.75em 1em',
        },
        '.dark th, .dark td': {
          'border-color': '#30363d',
        },
        'th': {
          'background-color': '#f6f8fa',
          'font-weight': '600',
        },
        '.dark th': {
          'background-color': '#161b22',
        },
        'tr:nth-child(2n)': {
          'background-color': '#f6f8fa',
        },
        '.dark tr:nth-child(2n)': {
          'background-color': '#161b22',
        },
        'a': {
            'text-decoration': 'none',
            'font-weight': '500',
        },
        'a:hover': {
            'text-decoration': 'underline',
        },
      }
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,600,700,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun',
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
      primary: '#3b82f6',
    }
  }
})
