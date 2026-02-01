import { useState, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { AskAI, type LimitStatus } from '@/apis/askAI';
import type { Message } from '../ui/MessageBubble';

const generateSessionId = () => Math.random().toString(36).substring(2, 15);

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
      content: `👋 嗨！我是本文的 AI 导读助手。关于《${title}》，有什么不懂的尽管问我！\n\n💡 **小贴士**：\n- **随用随走**：刷新页面后对话就会清空哦。\n- **按量供应**：全站共享 5 次免费提问额度，用完需要休息 30 - 60 分钟~`,
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
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content += ' [已中断]';
        }
        return newMsgs;
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
            try {
              const data = JSON.parse(ev.data);
              if (data.content) {
                accumulatedReply += data.content;
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = accumulatedReply;
                  }
                  return newMsgs;
                });
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('解析 SSE 出错', e);
            }
          }
        },
        async onopen(response) {
          if (response.status === 429) {
            const data = await response.json();
            const waitTime = data.detail?.wait_seconds || 600;
            throw new Error(`rate_limit:${waitTime}`);
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

      // 为了更好的 UX，立即更新本地计数
      setLimitStatus(
        limitStatus
          ? { ...limitStatus, request_count: limitStatus.request_count + 1 }
          : null,
      );
    } catch (err: any) {
      // 用户停止时预期会抛出 AbortError
      if (err.name === 'AbortError') return;

      let errorMsg = '连接 AI 服务失败，请检查网络连接或稍后再试。';
      if (err.message?.startsWith('rate_limit:')) {
        const waitTime = parseInt(err.message.split(':')[1]);
        errorMsg = `抱歉，您提问太快了。请等待 ${formatTime(waitTime)} 后再试。`;
        // 更新阻塞状态
        setLimitStatus(
          limitStatus
            ? {
                ...limitStatus,
                is_blocked: true,
                remaining_wait_seconds: waitTime,
              }
            : null,
        );
      }

      setMessages((prev) => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
          lastMsg.content = errorMsg;
        } else if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content) {
          lastMsg.content += `\n\n[系统错误: ${errorMsg}]`;
        }
        return newMsgs;
      });
    } finally {
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
