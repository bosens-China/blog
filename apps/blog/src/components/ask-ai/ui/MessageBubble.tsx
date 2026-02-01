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

export function MessageBubble({
  message: msg,
  isLoading,
  isLast,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 w-full ${
        msg.role === 'user' ? 'items-end' : 'items-start'
      }`}
    >
      {/* 角色标签 */}
      <span className="text-[10px] text-base-text-light/60 font-medium px-1 uppercase tracking-wider">
        {msg.role === 'assistant' ? 'AI' : 'ME'}
      </span>

      {/* 消息气泡容器 - 移除 w-full 改为自适应宽度 */}
      <div
        className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed break-words shadow-sm border max-w-[100%] ${
          msg.role === 'user'
            ? 'bg-primary text-white border-primary rounded-tr-sm self-end'
            : 'bg-white dark:bg-zinc-800/90 text-base-text dark:text-gray-100 border-base-border/50 dark:border-zinc-700/50 rounded-tl-sm self-start'
        }`}
      >
        {/* Markdown Render Area */}
        {msg.content ? (
          <div
            className={`prose prose-sm max-w-none break-words [&>p]:m-0 [&>p+p]:mt-2 [&>ul]:m-0 [&>ol]:m-0 [&>pre]:bg-black/10 [&>pre]:text-xs [&>pre]:p-2 [&>pre]:rounded ${
              msg.role === 'user'
                ? 'text-white prose-invert prose-p:text-white prose-a:text-white/90 prose-strong:text-white'
                : 'text-base-text dark:text-gray-100 dark:prose-invert prose-a:text-primary dark:prose-a:text-blue-400 prose-a:font-medium prose-a:underline-offset-2 prose-headings:text-base-text dark:prose-headings:text-gray-100 prose-strong:text-base-text dark:prose-strong:text-white'
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>
        ) : msg.role === 'assistant' && isLoading && isLast ? (
          <div className="flex gap-1 py-1.5 px-1">
            <div
              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
