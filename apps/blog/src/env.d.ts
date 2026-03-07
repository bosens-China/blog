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
  LiteTrack?: {
    track: (
      token: string,
      path: string,
      options?: { title?: string; apiUrl?: string },
    ) => void;
    getSiteStats: (
      token: string,
      apiUrl?: string,
    ) => Promise<{ totalViews: number; totalPages: number } | null>;
    getPageStats: (
      token: string,
      path: string,
      apiUrl?: string,
    ) => Promise<{ path: string; count: number } | null>;
  };
}

interface ImportMetaEnv {
  PUBLIC_DOGECLOUD_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
