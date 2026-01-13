/// <reference path="../.astro/types.d.ts" />

interface Window {
  getTheme: () => string;
  applyTheme: (theme: string) => void;
}
