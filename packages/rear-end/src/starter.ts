import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
dotenv.config();
dotenv.config({ path: path.join(__filename, "../", "../.env.local") });

// 检查所需环境变量是否传递，如果没有注入，直接抛出错误
if (!process.env.GITHUB_REPOSITORY) {
  throw new Error(`GITHUB_REPOSITORY 必须传递，请检查传入情况。`);
}

// 这样写是为了确保环境变量一定先注入
(async () => {
  await import("./gulp");
})();
