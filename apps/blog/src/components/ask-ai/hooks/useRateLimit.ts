import { useState, useEffect } from 'react';
import { AskAI, type LimitStatus } from '@/apis/askAI';

export function useRateLimit(isOpen: boolean, isServiceAvailable: boolean) {
  const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null);

  // 开启时轮询状态
  useEffect(() => {
    if (isOpen && isServiceAvailable) {
      AskAI.getLimitStatus().then(setLimitStatus);
    }
  }, [isOpen, isServiceAvailable]);

  // 倒计时定时器
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (limitStatus?.is_blocked && limitStatus.remaining_wait_seconds > 0) {
      timer = setInterval(() => {
        setLimitStatus((prev) => {
          if (!prev) return null;
          const newVal = prev.remaining_wait_seconds - 1;
          if (newVal <= 0) {
            return { ...prev, is_blocked: false, remaining_wait_seconds: 0 };
          }
          return { ...prev, remaining_wait_seconds: newVal };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [limitStatus?.is_blocked]);

  const updateLimitStatus = (status: LimitStatus) => {
    setLimitStatus(status);
  };

  return {
    limitStatus,
    updateLimitStatus,
  };
}
