declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // https://docs.github.com/cn/actions/security-guides/automatic-token-authentication#about-the-github_token-secret
      GITHUB_TOKEN?: string;
    }
  }
}

export {};
