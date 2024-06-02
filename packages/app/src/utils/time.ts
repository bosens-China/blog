import dayjs from "dayjs";

/**
 * 对比两个时间，如果相同返回参数0，否则返回1
 *
 * @param {(string | number)} creationTime
 * @param {(string | number)} modificationTime
 * @return {*}
 */
export const latestTime = (
  creationTime: string | number,
  modificationTime: string | number
) => {
  return [
    dayjs(modificationTime),
    dayjs(creationTime).isSame(modificationTime) ? 0 : 1,
  ] as const;
};
