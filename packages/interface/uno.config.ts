import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
  content: {
    filesystem: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  },
  presets: [presetUno()],
  shortcuts: {
    '_bor-1px': `border-color-[rgba(0,0,0,0.1)] border-b-solid border-width-1px`,
  },
});
