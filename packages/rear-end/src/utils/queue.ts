type Fn = () => any;

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

interface Options {
  sleepTime: number;
  maxRetry: number;
}

/**
 * 取随机整数
 */
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Queue {
  constructor(public list: Array<Fn>, public options?: Partial<Options>) {}

  // promise调用这个函数
  async then() {
    const { sleepTime, maxRetry = 1 } = this.options || {};
    const arr: Promise<any>[] = [];
    for (const iterator of this.list) {
      await this.next(iterator, maxRetry, sleepTime);
    }
    return arr;
  }

  async next(fn: Fn, maxRetry: number, sleepTime?: number) {
    for (let i = 0; ; i++) {
      try {
        const result = await fn();
        return result;
      } catch (e) {
        if (i >= maxRetry) {
          throw e;
        }
      } finally {
        // 限速
        sleepTime && (await sleep(sleepTime));
      }
    }
  }
}

export const queue = <T extends Fn>(
  list: Array<T>,
  options?: Partial<Options>
) => {
  const result = new Queue(list, options);

  return Promise.resolve(result) as Promise<ReturnType<T>>;
};
