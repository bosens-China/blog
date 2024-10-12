export const stacking = async <
  T extends (page?: number, ...rest: any[]) => Promise<Array<any>>,
  V extends Array<any> = Awaited<ReturnType<T>>,
>(
  fn: T,
  condition: (values: V) => boolean,
) => {
  const result = (await fn()) as V;
  if (!condition(result)) {
    return result;
  }
  for (let page = 2; true; page++) {
    const newResult = (await fn(page)) as V;
    result.push(...newResult);
    if (!condition(newResult)) {
      return result;
    }
  }

  return result;
};
