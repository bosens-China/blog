import React, { useRef, useEffect } from 'react';
import { MessageBubble, type Message } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 流式回复会高频更新 messages，用 'auto' 即时滚动，避免每个 token 都 smooth 动画导致移动端抖动
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto pl-6 pr-5 py-6 space-y-6">
      {messages.map((msg, idx) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isLoading={isLoading}
          isLast={idx === messages.length - 1}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
