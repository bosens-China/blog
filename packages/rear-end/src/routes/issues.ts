import { Data, issuesDb } from "../database/issues";
import { getIssues } from "../api/issues";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

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
  .get("/", async (c) => {
    const data = await readData();
    return c.json(data);
  })
  .get(
    "/filtration",
    zValidator(
      "query",
      z.object({
        pageSize: z.number().default(10),
      })
    ),
    async (c) => {
      const { pageSize } = c.req.valid("query");
      const data = await readData();
      const result = await splitArrayBySize(data, pageSize);
      return c.json({
        result,
      });
    }
  );

export default app;
