import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AskAI } from '@/apis/askAI';
import { FloatingButton } from './ask-ai/ui/FloatingButton';
import { MessageList } from './ask-ai/ui/MessageList';
import { ChatInput } from './ask-ai/ui/ChatInput';
import { useRateLimit } from './ask-ai/hooks/useRateLimit';
import { useChat } from './ask-ai/hooks/useChat';

interface AskAIWidgetProps {
  postId: string | number;
  title: string;
}

export default function AskAIWidget({ postId, title }: AskAIWidgetProps) {
  const [isServiceAvailable, setIsServiceAvailable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 初始化时检查 AI 服务健康状况
  useEffect(() => {
    setMounted(true);
    AskAI.checkHealth().then(setIsServiceAvailable);
  }, []);

  // 展开时锁定 body 滚动条
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // 频率限制与状态管理
  const rateLimit = useRateLimit(isOpen, isServiceAvailable);

  /**
   * 适配器函数：桥接 useChat 内部的状态更新需求与 useRateLimit 的操作接口。
   * 这样可以保持 useChat 钩子的通用性，而不必深度绑定频率限制的具体实现。
   */
  const handleLimitUpdate = (status: any) => {
    if (!status) return;
    rateLimit.updateLimitStatus(status);
  };

  const chat = useChat(postId, title, handleLimitUpdate);

  if (!isServiceAvailable) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${
        isOpen ? 'visible' : 'invisible'
      }`}
    >
      {/* 背景遮罩 */}
      <div
        className={`absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* 侧边栏/底边栏容器 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-widget-title"
        className={`absolute right-0 bottom-0 w-full md:w-[400px] h-[85vh] h-[85dvh] md:h-full bg-base-bg md:border-l border-t md:border-t-0 border-base-border shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
        } rounded-t-2xl md:rounded-none`}
      >
        {/* 头部区域 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-border/50 bg-base-bg/80 backdrop-blur-md sticky top-0 z-10 rounded-t-2xl md:rounded-none">
          <div className="flex items-center gap-3">
            <h2
              id="ai-widget-title"
              className="font-medium text-base-text text-[15px] tracking-wide"
            >
              AI 智能助手
            </h2>
            {rateLimit.limitStatus && !rateLimit.limitStatus.is_blocked && (
              <span
                className="text-[10px] font-mono leading-none px-2 py-1 rounded-full bg-base-fill text-base-text-light border border-base-border/60"
                title="今日已用次数 / 总额度"
              >
                {rateLimit.limitStatus.request_count} / 5
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="关闭对话框"
            className="text-base-text-light hover:text-base-text transition-colors flex items-center justify-center"
          >
            <div className="i-carbon-close w-5 h-5" />
          </button>
        </div>

        {/* 消息列表区域 */}
        <MessageList messages={chat.messages} isLoading={chat.isLoading} />

        {/* 输入交互区域 */}
        <ChatInput
          inputValue={chat.inputValue}
          setInputValue={chat.setInputValue}
          isLoading={chat.isLoading}
          limitStatus={rateLimit.limitStatus}
          onSend={() => chat.handleSend(rateLimit.limitStatus)}
          onStop={chat.handleStop}
        />
      </div>
    </div>
  );

  return (
    <>
      <FloatingButton isOpen={isOpen} onClick={() => setIsOpen(true)} />
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
