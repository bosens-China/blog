import { themePreset } from './plugins/theme-preset';
import { defineConfig, presetUno, transformerVariantGroup } from 'unocss';

export default defineConfig({
  content: {
    filesystem: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  },
  transformers: [transformerVariantGroup()],
  presets: [
    presetUno(),
    themePreset({
      light: {
        primary: '#0F7AE5',
      },
      dark: {
        primary: '#2B8EF0',
      },
    }),
  ],
  shortcuts: {
    '_bor-1px': `border-color-[rgba(0,0,0,0.1)] border-b-solid border-width-1px`,
    _expand: `border-0.5rem border-solid border-color-transparent`,
  },
});
