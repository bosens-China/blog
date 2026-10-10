import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
  isLast?: boolean;
}

/**
 * AI 回复按正文排版铺满宽度；代码块与文章正文共用背景与边框
 * 全站 typography 配置把 .prose pre 的背景与内边距清空了，这里需要用 ! 提升优先级
 */
const ASSISTANT_PROSE =
  'prose prose-neutral prose-sm dark:prose-invert max-w-none break-words text-base-text [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_pre]:!my-3 [&_pre]:!px-3.5 [&_pre]:!py-3 [&_pre]:overflow-x-auto [&_pre]:!rounded-lg [&_pre]:border [&_pre]:border-base-border [&_pre]:!bg-[var(--shiki-bg)] [&_pre]:text-[13px] [&_pre]:leading-relaxed';

function TypingIndicator() {
  return (
    <div className="flex gap-1 py-2 text-base-text-light" aria-label="正在生成">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 bg-current rounded-full animate-bounce motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export function MessageBubble({
  message: msg,
  isLoading,
  isLast,
}: MessageBubbleProps) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-xl bg-base-fill px-3.5 py-2.5 text-[14px] leading-relaxed text-base-text whitespace-pre-wrap break-words">
          {msg.content}
        </div>
      </div>
    );
  }

  if (!msg.content) {
    return isLoading && isLast ? <TypingIndicator /> : null;
  }

  return (
    <div className={ASSISTANT_PROSE}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
    </div>
  );
}
