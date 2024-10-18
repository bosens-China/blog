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
        bg: '#F6F5FA',
        bg2: '#FFFFFF',
        title: '#222',
        text: '#666',
        describe: '#666',
        describe1: '#999',
        'border-color': 'rgba(0,0,0,0.1)',
        admire: '#FF3509',
        'btn-title': '#fff',
        share: 'rgba(0,0,0,0.05)',
      },
      dark: {
        primary: '#2B8EF0',
        bg: '#111111',
        bg2: 'rgba(255,255,255,0.2)',
        title: '#EFEFEF',
        'btn-title': '#EFEFEF',
        text: '#ccc',
        describe: '#999',
        describe1: '#ccc',
        'border-color': 'rgba(255,255,255,0.2)',
        admire: '#FF6948',
        share: `rgba(255,255,255,0.1)`,
      },
    }),
  ],
  shortcuts: {
    '_bor-1px': `border-color-border-color border-b-solid border-width-1px`,
    _expand: `border-0.5rem border-solid border-color-transparent`,
  },
});
