import data from "./data.json";

// 对数据进行封装，方便调用

export const classification: Map<
  string,
  Set<(typeof data.issuesData)[number]>
> = new Map();

data.issuesData.forEach((item) => {
  item.labels.forEach((key) => {
    const id = `${key.id}`;
    if (!classification.has(id)) {
      classification.set(id, new Set());
    }
    const set = classification.get(id);
    set?.add(item);
  });
});

console.log(process.env);

export default data;
