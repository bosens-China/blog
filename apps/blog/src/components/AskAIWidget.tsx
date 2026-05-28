import React, { useState, useEffect, useRef } from 'react';
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
  const scrollLockedRef = useRef(false);

  // 初始化时检查 AI 服务健康状况
  useEffect(() => {
    setMounted(true);
    AskAI.checkHealth().then(setIsServiceAvailable);
  }, []);

  // 展开时锁定 body 滚动条（移动端需要更强的处理）
  useEffect(() => {
    if (!isOpen) return;

    // 保存当前滚动位置
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // 设置 body 为 fixed 定位来完全阻止滚动（移动端关键）
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 存储滚动位置以便恢复
    document.body.dataset.scrollY = String(scrollY);
    document.body.dataset.scrollX = String(scrollX);
    scrollLockedRef.current = true;

    return () => {
      if (!scrollLockedRef.current) return;

      // 恢复滚动位置
      const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      const scrollX = parseInt(document.body.dataset.scrollX || '0', 10);

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      // 恢复到之前的滚动位置
      window.scrollTo(scrollX, scrollY);
      delete document.body.dataset.scrollY;
      delete document.body.dataset.scrollX;
      scrollLockedRef.current = false;
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
      style={{ touchAction: 'none' }}
    >
      {/* 背景遮罩 - 移动端增加不透明度确保完全遮挡底部内容 */}
      <div
        className={`absolute inset-0 bg-black/60 md:bg-black/20 dark:bg-black/80 md:dark:bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
        onTouchMove={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
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
        style={{ overscrollBehavior: 'contain' }}
        onTouchMove={(e) => e.stopPropagation()}
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
