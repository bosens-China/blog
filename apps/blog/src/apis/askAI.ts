export const API_BASE =
  import.meta.env.PUBLIC_ASK_AI_API || 'http://localhost:8000';

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
    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3秒超时
      });
      return res.ok;
    } catch (err) {
      console.warn('Ask AI 服务已离线:', err);
      return false;
    }
  },

  /**
   * 获取限流状态
   */
  getLimitStatus: async (): Promise<LimitStatus | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/limit-status`);
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
