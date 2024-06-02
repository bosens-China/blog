import { Data, issuesDb } from "../database/issues";
import { IssuesDaum, IssuesTypes, getIssues } from "../api/issues";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { client } from "../utils/request";
import { Label } from "../api/labels";
import { ResultArticle } from "./convert";

function splitArrayBySize<T>(array: T[], size: number): [number, T[]][] {
  const result: [number, T[]][] = [];
  let page = 0;
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size);
    page += 1;
    result.push([page, chunk]);
  }

  return result;
}

export const readData = async () => {
  if (!issuesDb.data.length) {
    const data: Data = [];
    // 直接循环到抓取不到为止
    // eslint-disable-next-line no-constant-condition
    for (let page = 1; true; page = page + 1) {
      const res = await getIssues(page);

      if (!res.length) {
        break;
      }
      data.push(...res);
    }

    issuesDb.data = data;
    issuesDb.write();
  }

  return issuesDb.data;
};

/*
 * 类型推到必须这样写
 */
const app = new Hono()
  // 返回所有的问题
  .get("/", async (c) => {
    const data = await readData();
    return c.json(data);
  })
  // 传入type和id返回所有的文章id
  .get(
    "/search",
    zValidator(
      "query",
      z.object({
        type: z.string(),
        page: z.string(),
        pageSize: z.string().default("10"),
      })
    ),
    async (c) => {
      const { type, page, pageSize } = c.req.valid("query");
      const res = (await client.api.issues.filtration[":type"].$get({
        param: { type },
        query: {
          pageSize,
        },
      })) as any;

      if (!res.ok) {
        return c.notFound();
      }
      const data = await res.json();

      const allPage: number[] = data.map((item: any) => item[0]);
      const find = data.find((f: any) => f[0] === +page)[1] as IssuesDaum[];

      // 转换一层返回
      const convertResult = (await Promise.all(
        find.map((item) => {
          return client.api.convert.article[":id"]
            .$get({ param: { id: `${item.id}` } })
            .then((res: any) => res.json());
        })
      )) as ResultArticle[];

      // 返回所有分页的数据，
      return c.json({
        page: allPage,
        data: convertResult,
      });
    }
  )
  // 给定id，来进行搜索指定文章
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const data = await readData();
    const result = data.find((f) => f.id === +id);
    if (!result) {
      return c.notFound();
    }
    return c.json(result);
  })
  // 分页数据，支持分页大小展示，会展示所有页面，以及所有分类
  .get(
    "/filtration/:type",
    zValidator(
      "query",
      z.object({
        pageSize: z.string().default("10"),
        page: z.string().default(""),
      })
    ),
    async (c) => {
      const { pageSize, page } = c.req.valid("query");

      const type = c.req.param("type");

      const data = await readData();
      const all = await splitArrayBySize(data, +pageSize);

      const { data: labelsAll } = await client.api.labels
        .$get()
        .then((res) => res.json());

      const obj: Record<"all" | "unknown" | string, typeof all> = {
        all,
        unknown: [],
      };
      const labelsMap = new Map<Label | "unknown", IssuesTypes>(
        labelsAll as any
      );
      for (const [key, value] of labelsMap) {
        if (key === "unknown") {
          obj["unknown"] = await splitArrayBySize(value, +pageSize);
        } else {
          obj[key.id] = await splitArrayBySize(value, +pageSize);
        }
      }

      if (type) {
        if (page) {
          const find = obj[type].find((f) => f[0] === +page)?.[1];
          return c.json(find);
        }
        return c.json(obj[type]);
      }
      if (page) {
        const find = obj.all.find((f) => f[0] === +page)?.[1];
        return c.json(find);
      }

      return c.json(obj);
    }
  );

export default app;
