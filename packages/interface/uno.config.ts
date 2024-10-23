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
      primary: {
        light: '#0F7AE5',
        dark: '#2B8EF0',
      },
      bg: {
        light: '#F6F5FA',
        dark: '#111111',
      },
      bg2: {
        light: '#FFFFFF',
        dark: 'rgba(255,255,255,0.2)',
      },
      title: {
        light: '#222',
        dark: '#EFEFEF',
      },
      text: {
        light: '#666',
        dark: '#ccc',
      },
      describe: {
        light: '#666',
        dark: '#999',
      },
      describe1: {
        light: '#999',
        dark: '#ccc',
      },
      'border-color': {
        light: 'rgba(0,0,0,0.1)',
        dark: 'rgba(255,255,255,0.2)',
      },
      admire: {
        light: '#FF3509',
        dark: '#FF6948',
      },
      'btn-title': {
        light: '#fff',
        dark: '#EFEFEF',
      },
      share: {
        light: 'rgba(0,0,0,0.05)',
        dark: 'rgba(255,255,255,0.1)',
      },
      button: {
        hover: {
          light: '#3f95ea',
          dark: '#4099f2',
        },
        active: {
          light: '#0d6ece',
          dark: '#2272c0',
        },
      },
      link: {
        color: '#999',
        hover: {
          light: '#2b8ef0',
          dark: '#0f7ae5',
        },
      },
      code: '#333',
      codeTitle: '#fff',
    }),
  ],
  shortcuts: {
    '_bor-1px': `border-color-border-color border-b-solid border-width-1px`,
    _expand: `border-0.5rem border-solid border-color-transparent`,
  },
});
