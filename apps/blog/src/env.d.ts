interface Window {
  getTheme: () => string;
  applyTheme: (theme: string) => void;
  pagefind?: {
    options: (options: any) => Promise<void>;
    search: (term: string) => Promise<{
      results: {
        id: string;
        data: () => Promise<any>;
        score: number;
      }[];
    }>;
    preload: (term: string) => Promise<void>;
    destroy: () => void;
    init: () => Promise<void>;
  };
}

interface ImportMetaEnv {
  PUBLIC_DOGECLOUD_IMAGE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
