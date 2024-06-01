import { Data, labelDb } from "../database/labels";
import { getLabels } from "../api/labels";
import { readData as issuesReadData } from "./issues";
import { IssuesTypes } from "../api/issues";
import { Hono } from "hono";
// import { zValidator } from "@hono/zod-validator";
// import { z } from "zod";

export const readData = async () => {
  if (!labelDb.data.length) {
    const data: Data = [];
    // 直接循环到抓取不到为止
    // eslint-disable-next-line no-constant-condition
    for (let page = 1; true; page = page + 1) {
      const res = await getLabels(page);

      if (!res.length) {
        break;
      }
      data.push(...res);
    }

    labelDb.data = data;
    labelDb.write();
  }
  return labelDb.data;
};

export const all = async () => {
  const data = labelDb.data;
  const issuesData = await issuesReadData();
  // const res:Array<[Label, IssuesTypes]> = [];

  const map = new Map<"unknown" | number, IssuesTypes>();

  for (const iterator of issuesData) {
    const { labels } = iterator;
    if (!labels.length) {
      if (!map.has("unknown")) {
        map.set("unknown", []);
      }
      const result = map.get("unknown")!;
      result.push(iterator);
      continue;
    }
    labels.forEach((item) => {
      if (!map.has(item.id)) {
        map.set(item.id, []);
      }
      const result = map.get(item.id)!;
      result.push(iterator);
    });
  }
  // 对result的数据进行一层还原
  const json = Array.from(map.entries()).map(([key, values]) => {
    if (key === "unknown") {
      return [key, values] as const;
    }
    const k = data.find((f) => f.id === key);
    return [k, values] as const;
  });
  return json;
};

const app = new Hono().get("/", async (c) => {
  const data = await all();
  return c.json(data);
});
// .get(
//   "/determine",
//   zValidator(
//     "query",
//     z
//       .object({
//         type: z.string(),
//       })
//       .required()
//   ),
//   async (c) => {
//     const { type } = c.req.valid("query");
//     const data = await all();
//     const result = data.some((f) => {
//       const [value] = f;
//       if (value === "unknown") {
//         return value === type;
//       }
//       return `${value?.id}` === type;
//     });
//     return c.json({ result });
//   }
// );

export default app;
