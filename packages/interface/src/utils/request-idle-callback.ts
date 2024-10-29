export const requestIdleCallback = (() => {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback;
  }

  type IdleDeadline = {
    didTimeout: boolean;
    timeRemaining: () => number;
  };

  type RequestIdleCallbackHandle = number;

  type RequestIdleCallbackOptions = {
    timeout?: number;
  };

  return function (
    callback: (deadline: IdleDeadline) => void,
    options?: RequestIdleCallbackOptions,
  ): RequestIdleCallbackHandle {
    const timeout = options?.timeout ?? 50;
    return setTimeout(() => {
      const start = Date.now();
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, timeout) as unknown as number;
  };

  // if (typeof window.cancelIdleCallback !== 'function') {
  //   window.cancelIdleCallback = function (handle: RequestIdleCallbackHandle): void {
  //     window.clearTimeout(handle);
  //   };
  // }
})();
