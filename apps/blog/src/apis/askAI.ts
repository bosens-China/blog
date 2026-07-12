import { API_BASE, apiFetch } from './client';
import { isServiceHealthy } from './health';

// 单条提问最大字符数，需与后端 MAX_MESSAGE_LENGTH 保持一致
export const MAX_MESSAGE_LENGTH = 10000;

export interface LimitStatus {
  request_count: number;
  limit: number;
  remaining_wait_seconds: number;
  is_blocked: boolean;
  next_level_wait: number;
}

export const AskAI = {
  /**
   * 检查服务健康状态
   */
  checkHealth: async (): Promise<boolean> => {
    return isServiceHealthy('ai');
  },

  /**
   * 获取限流状态
   */
  getLimitStatus: async (): Promise<LimitStatus | null> => {
    try {
      const res = await apiFetch('/api/limit-status');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('获取限流状态失败', err);
    }
    return null;
  },

  /**
   * 获取 Chat 接口地址 (供 fetchEventSource 使用)
   */
  getChatEndpoint: () => `${API_BASE}/api/chat`,
};
