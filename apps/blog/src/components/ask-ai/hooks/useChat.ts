import { useState, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { AskAI, type LimitStatus } from '@/apis/askAI';
import type { Message } from '../ui/MessageBubble';

const generateSessionId = () => Math.random().toString(36).substring(2, 15);

interface StreamPayload {
  content?: string;
  error?: string;
}

// 用于错误信息的格式化时间工具函数
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export function useChat(
  postId: string | number,
  title: string,
  setLimitStatus: (status: LimitStatus | null) => void,
) {
  const [sessionId] = useState(() => generateSessionId());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 嗨！我是本文的 AI 导读助手。关于《${title}》，有什么不懂的尽管问我！\n\n💡 **小贴士**：\n- **随用随走**：刷新页面后对话就会清空哦。\n- **按量供应**：每人每小时有免费提问额度，用完休息一下就好~`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (!lastMsg || lastMsg.role !== 'assistant') return prev;
        return [
          ...prev.slice(0, -1),
          { ...lastMsg, content: `${lastMsg.content} [已中断]` },
        ];
      });
    }
  };

  const handleSend = async (limitStatus: LimitStatus | null) => {
    if (!inputValue.trim() || isLoading || limitStatus?.is_blocked) return;

    const userContent = inputValue.trim();
    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: userContent },
      { id: aiMsgId, role: 'assistant', content: '' },
    ]);

    setInputValue('');
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    // 为了更好的 UX，立即更新本地计数
    if (limitStatus) {
      setLimitStatus({
        ...limitStatus,
        request_count: limitStatus.request_count + 1,
      });
    }

    let accumulatedReply = '';

    try {
      await fetchEventSource(AskAI.getChatEndpoint(), {
        method: 'POST',
        signal: abortControllerRef.current.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          session_id: sessionId,
          message: userContent,
        }),
        openWhenHidden: true,
        onmessage(ev) {
          if (ev.data) {
            let data: StreamPayload;

            try {
              data = JSON.parse(ev.data) as StreamPayload;
            } catch (e) {
              console.error('解析 SSE 出错', e);
              return;
            }

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.content) {
              accumulatedReply += data.content;
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (!lastMsg || lastMsg.role !== 'assistant') return prev;
                return [
                  ...prev.slice(0, -1),
                  { ...lastMsg, content: accumulatedReply },
                ];
              });
            }
          }
        },
        async onopen(response) {
          if (response.status === 429) {
            const data = await response.json().catch(() => ({}));
            const detail = data.detail || {};
            const waitTime = detail.wait_seconds || 0;
            const serverMsg = detail.message || '';
            // 用 \x1f 作分隔符，避免与中文消息里的冒号冲突
            throw new Error(`rate_limit:${waitTime}\x1f${serverMsg}`);
          }
          if (!response.ok) {
            throw new Error('连接 AI 服务失败');
          }
        },
        onclose() {},
        onerror(err) {
          if (err instanceof Error && err.message.startsWith('rate_limit:')) {
            throw err;
          }
          throw err;
        },
      });
    } catch (err: any) {
      // 用户停止时预期会抛出 AbortError
      if (err.name === 'AbortError') return;

      let errorMsg = '连接 AI 服务失败，请检查网络连接或稍后再试。';
      if (err.message?.startsWith('rate_limit:')) {
        const [head, serverMsg = ''] = err.message.split('\x1f');
        const waitTime = parseInt(head.slice('rate_limit:'.length), 10) || 0;
        if (waitTime > 0) {
          // 有明确等待时间（配额/突发）：展示倒计时并进入阻塞态
          errorMsg = `抱歉，${serverMsg || '您提问太快了'}请等待 ${formatTime(waitTime)} 后再试。`;
          setLimitStatus(
            limitStatus
              ? {
                  ...limitStatus,
                  is_blocked: true,
                  remaining_wait_seconds: waitTime,
                }
              : null,
          );
        } else {
          // 无等待时间（如全局每日熔断）：直接展示服务端文案
          errorMsg = serverMsg || '今日额度已用完，请明天再来。';
        }
      }

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (!lastMsg || lastMsg.role !== 'assistant') return prev;
        const content = lastMsg.content
          ? `${lastMsg.content}\n\n[系统错误: ${errorMsg}]`
          : errorMsg;
        return [...prev.slice(0, -1), { ...lastMsg, content }];
      });
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
      // 对话结束后刷新状态以与服务器同步
      AskAI.getLimitStatus().then(setLimitStatus);
    }
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSend,
    handleStop,
  };
}
