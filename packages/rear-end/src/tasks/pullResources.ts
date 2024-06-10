/*
 * 拉取所有接口资源
 */

import { getIssues } from "@/api/issues";
import { getLabels } from "@/api/labels";
import { getUser } from "@/api/user";
import { issuesDb } from "@/database/issues";
import { labelDb } from "@/database/labels";
import { userDb } from "@/database/user";

/*
 * 作用是拉取，直到拉取结束
 */
const repeat = async <T extends (page: number) => Promise<any[]> | any[]>(
  fn: T,
  callback: (result: any[]) => boolean = (res) => {
    return !!res.length;
  }
) => {
  const data: any[] = [];
  for (let page = 1; ; page = page + 1) {
    const res = await fn(page);

    if (!callback(res)) {
      break;
    }
    data.push(...res);
  }
  return data as Awaited<ReturnType<T>>;
};

export default async function pullResources() {
  console.time(`pullResources`);
  const [labels, issues, user] = await Promise.all([
    labelDb.data.length ? labelDb.data : repeat(getLabels),
    issuesDb.data.length ? issuesDb.data : repeat(getIssues),
    Object.keys(userDb.data).length ? userDb.data : getUser(),
  ]);
  // 写入到数据库
  issuesDb.data = issues;
  labelDb.data = labels;
  userDb.data = user;
  await Promise.all([issuesDb.write(), labelDb.write(), userDb.write()]);
  console.timeEnd(`pullResources`);
}
