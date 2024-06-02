import { Hono } from "hono";
import { client } from "../utils/request";
import { IssuesDaum } from "../api/issues";
import { nodeInterception } from "dom-interception/node";
import { extractImgTags, toHtml } from "../utils/md";

export type ResultArticle = IssuesDaum & { intro: string; imgs: Array<string> };

const app = new Hono()
  // 翻译文章，主要是给文章图片进行上传，以及返回简介等信息
  .get("/article/:id", async (c) => {
    const id = c.req.param("id");
    const res = await client.api.issues[":id"].$get({ param: { id } });
    if (!res.ok) {
      return c.notFound();
    }
    const data = (await res.json()) as ResultArticle;
    // 提取简介
    const intro = nodeInterception(toHtml(data.body || ""), {
      length: 120,
      // fill: false,
    });
    data.intro = intro.text.trim();
    // 提取所有图片，然后进行上传
    const imgs = extractImgTags(data.body || "");
    data.imgs = imgs;
    for (const url of imgs) {
      const res = await client.api.upload
        .$get({ query: { url } })
        .catch(() => {});
      if (res && res.ok) {
        const { masterDrawing } = await res.json();
        // 替换
        data.body = data.body?.replace(url, masterDrawing);
        data.imgs.splice(data.imgs.indexOf(url), 1, masterDrawing);
      }
    }
    return c.json({ ...data });
  });

export default app;
