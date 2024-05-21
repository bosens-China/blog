import data from "./data.json";

// 对数据进行封装，方便调用
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const classification = new Map(data.labelsMap as any) as Map<
  string,
  typeof data.issuesData
>;

const map = new Map<string, (typeof data.label)[number] | undefined>();

export const getLabel = (id: string) => {
  if (map.has(id)) {
    return map.get(id);
  }
  const result = data.label.find((f) => f.id === +id);
  map.set(id, result);
  return result;
};

export { data };
export default data;
