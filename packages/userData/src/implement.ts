import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";

dotenv.config();

const { OWNER, REPO } = process.env;

const continued = async <T extends (page?: number) => Promise<unknown[]>>(
  fn: T,
  page = 1
) => {
  const result = await fn(page);
  if (Array.isArray(result) && result.length) {
    const arr = await continued(fn, page + 1);
    result.push(...arr);
  }
  return result;
};

(async () => {
  console.time(`Start crawling the required data...`);
  const { labels, issues, user } = await import("./api");
  try {
    const [labelsData, issuesData, userData] = await Promise.all([
      continued(labels),
      continued(issues),
      user(),
    ]);
    await fs.writeJson(
      path.join(__dirname, "./data.json"),
      {
        label: labelsData,
        issuesData: issuesData,
        user: { ...userData, OWNER, REPO },
      },
      { spaces: 2 }
    );
  } catch (e) {
    console.log(e instanceof Error ? e.message : e);
  }
  console.timeEnd(`Start crawling the required data...`);
})();
