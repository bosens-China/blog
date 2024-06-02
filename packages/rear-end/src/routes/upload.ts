import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { upload } from "../api/upload";
import path from "path";
import { fileURLToPath } from "url";
import { uploadDb } from "../database/upload";
import { downloadImage, getFileName } from "../utils/fs";

const __filename = fileURLToPath(import.meta.url);
const dir = path.join(__filename, "../../temporarily/imgage");

// 给一个标识，一个个处理上传，防止别人服务器直接噶了
let underWay: Promise<any> = Promise.resolve();

const app = new Hono().get(
  "/",
  zValidator(
    "query",
    z
      .object({
        url: z.string(),
      })
      .required()
  ),
  async (c) => {
    const { url } = c.req.valid("query");

    if (!uploadDb.data[url]) {
      const task = async () => {
        const filePath = path.join(dir, getFileName(url));
        await downloadImage(url, filePath);
        const data = await upload(filePath);
        uploadDb.data[url] = data;
        uploadDb.write();
      };
      await underWay;
      underWay = task();
      await underWay;
    }
    const result = uploadDb.data[url];

    return c.json(result);
  }
);

export default app;
