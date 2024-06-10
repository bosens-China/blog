/*
 * 将一些数据进行加工，输出到temporarily目录下
 */

import { IssuesTypes } from "@/api/issues";
import { Label } from "@/api/labels";
import { issuesDb } from "@/database/issues";
import { labelDb } from "@/database/labels";

const friendlyDataLabels = () => {
  const data = labelDb.data;
  const issuesData = issuesDb.data;
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
      return [key, values];
    }
    const k = data.find((f) => f.id === key)!;
    return [k, values];
  });
  return json as unknown as [Label | "unknown", IssuesTypes];
};

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

const friendlyDataIssues = (pageSize = 10) => {
  const data = issuesDb.data;
  const all = splitArrayBySize(data, +pageSize);

  const labelsAll = friendlyDataLabels();

  const obj: Record<"all" | "unknown" | string, typeof all> = {
    all,
    unknown: [],
  };
  const labelsMap = new Map<Label | "unknown", IssuesTypes>(labelsAll as any);
  for (const [key, value] of labelsMap) {
    if (key === "unknown") {
      obj["unknown"] = splitArrayBySize(value, +pageSize);
    } else {
      obj[key.id] = splitArrayBySize(value, +pageSize);
    }
  }

  return obj;
  // if (type) {
  //   if (page) {
  //     const find = obj[type].find((f) => f[0] === +page)?.[1];
  //     return c.json(find);
  //   }
  //   return c.json(obj[type]);
  // }
  // if (page) {
  //   const find = obj.all.find((f) => f[0] === +page)?.[1];
  //   return c.json(find);
  // }
};
