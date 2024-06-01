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
      const filePath = path.join(dir, getFileName(url));
      await downloadImage(url, filePath);
      const data = await upload(filePath);
      uploadDb.data[url] = data;
      uploadDb.write();
    }

    return c.json(uploadDb.data[url]);
  }
);

export default app;
