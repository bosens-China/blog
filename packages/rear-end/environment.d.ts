declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_REPOSITORY: string;
      AUTHORIZATION: string;

      // 环境变量
      NODE_ENV: "development" | "production";
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
