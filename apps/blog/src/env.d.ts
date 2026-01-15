interface Window {
  getTheme: () => string;
  applyTheme: (theme: string) => void;
}

interface ImportMetaEnv {
  PUBLIC_DOGECLOUD_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
