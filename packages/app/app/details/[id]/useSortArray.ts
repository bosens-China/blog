import { useEffect, useState } from 'react';

const interval = 4;

export const useSortArray = <T>(arr: Array<T | null>) => {
  const [array, setArray] = useState(arr);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!arr.length) {
      return;
    }

    const id = setInterval(() => {
      const copy = array;
      // 为下一次循环做准备，假设长度为7，当第一次循环结束index为4，则后面取不到值了
      let current = index + interval;
      const total = current + interval;

      for (; current < total; current++) {
        if (current > arr.length - 1) {
          // 对数组准备进行下标移动
          const i = current - arr.length;
          copy.push(copy[i]);
          copy[i] = null;
        }
      }
      // const notNull = copy.filter((f) => f);
      setIndex(current - interval);
      setArray(copy);
    }, 3000);

    return () => {
      clearInterval(id);
    };
  }, [index, arr, array]);

  return { array, index };
};
