import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FloatingButton } from './ask-ai/ui/FloatingButton';
import AuthMenu from '@/components/auth/AuthMenu';
import { MessageList } from './ask-ai/ui/MessageList';
import { ChatInput } from './ask-ai/ui/ChatInput';
import { useRateLimit } from './ask-ai/hooks/useRateLimit';
import { useChat } from './ask-ai/hooks/useChat';
import { AskAI, type LimitStatus } from '@/apis/askAI';
import { AuthApi } from '@/apis/auth';
import { useAuth } from '@/hooks/useAuth';

interface AskAIWidgetProps {
  postId: string | number;
  title: string;
}

export default function AskAIWidget({ postId, title }: AskAIWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState(false);
  const scrollLockedRef = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    void AskAI.checkHealth().then(setIsServiceAvailable);

    const media = window.matchMedia('(max-width: 767px)');
    const updateMode = () => setIsMobile(media.matches);
    updateMode();
    media.addEventListener('change', updateMode);
    return () => media.removeEventListener('change', updateMode);
  }, []);

  // 桌面端为页面留出侧栏空间，移动端则锁定底层页面滚动。
  useEffect(() => {
    if (!isOpen) return;

    if (!isMobile) {
      document.body.classList.add('ai-panel-open');
      return () => {
        document.body.classList.remove('ai-panel-open');
      };
    }

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    document.body.dataset.scrollY = String(scrollY);
    document.body.dataset.scrollX = String(scrollX);
    scrollLockedRef.current = true;

    return () => {
      if (!scrollLockedRef.current) return;

      const savedScrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      const savedScrollX = parseInt(document.body.dataset.scrollX || '0', 10);

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      window.scrollTo(savedScrollX, savedScrollY);
      delete document.body.dataset.scrollY;
      delete document.body.dataset.scrollX;
      scrollLockedRef.current = false;
    };
  }, [isMobile, isOpen]);

  // 频率限制与状态管理
  const rateLimit = useRateLimit(isOpen && Boolean(user), isServiceAvailable);

  /**
   * 适配器函数：桥接 useChat 内部的状态更新需求与 useRateLimit 的操作接口。
   * 这样可以保持 useChat 钩子的通用性，而不必深度绑定频率限制的具体实现。
   */
  const handleLimitUpdate = (status: LimitStatus | null) => {
    if (!status) return;
    rateLimit.updateLimitStatus(status);
  };

  const chat = useChat(postId, title, handleLimitUpdate);

  if (!isServiceAvailable) return null;

  const modalContent = (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] transition-all duration-300 md:left-auto md:w-[var(--ai-panel-width)] ${
        isOpen ? 'visible' : 'invisible'
      }`}
    >
      {/* H5 使用底部弹层；桌面端保持页面可交互。 */}
      <div
        className={`pointer-events-auto absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/80 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
        onTouchMove={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
      />

      {/* 侧边栏/底边栏容器 */}
      <div
        role={isMobile ? 'dialog' : 'complementary'}
        aria-modal={isMobile || undefined}
        aria-labelledby="ai-widget-title"
        className={`pointer-events-auto absolute right-0 bottom-0 flex h-[85vh] h-[85dvh] w-full transform flex-col border-t border-base-border bg-base-bg shadow-2xl transition-transform duration-300 ease-out md:h-full md:border-l md:border-t-0 md:shadow-none ${
          isOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
        } rounded-t-2xl md:rounded-none`}
        style={{ overscrollBehavior: 'contain' }}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* 头部区域 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-base-border/50 bg-base-bg/80 px-4 py-5 backdrop-blur-md sm:px-6 rounded-t-2xl md:h-16 md:py-0 md:rounded-none">
          <div className="flex items-center gap-3">
            <h2
              id="ai-widget-title"
              className="whitespace-nowrap font-medium text-base-text text-[15px] tracking-wide"
            >
              AI 智能助手
            </h2>
            {user &&
              rateLimit.limitStatus &&
              !rateLimit.limitStatus.is_blocked && (
                <span
                  className="shrink-0 whitespace-nowrap text-[10px] font-mono leading-none px-2 py-1 rounded-full bg-base-fill text-base-text-light border border-base-border/60"
                  title="今日已用次数 / 总额度"
                >
                  {rateLimit.limitStatus.request_count} /{' '}
                  {rateLimit.limitStatus.limit}
                </span>
              )}
          </div>
          <div className="flex items-center gap-1">
            {user && <AuthMenu align="right" showName />}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="关闭对话框"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-base-text-light transition-colors hover:bg-base-hover hover:text-base-text"
            >
              <div className="i-carbon-close w-5 h-5" />
            </button>
          </div>
        </div>

        {user ? (
          <>
            <MessageList messages={chat.messages} isLoading={chat.isLoading} />
            <ChatInput
              inputValue={chat.inputValue}
              setInputValue={chat.setInputValue}
              isLoading={chat.isLoading}
              limitStatus={rateLimit.limitStatus}
              onSend={() => chat.handleSend(rateLimit.limitStatus)}
              onStop={chat.handleStop}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-fill text-base-text-light">
              <span className="i-carbon-locked h-6 w-6" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-base-text">
              登录后使用 AI 助手
            </h3>
            <p className="mt-2 max-w-64 text-sm leading-relaxed text-base-text-light">
              使用 GitHub 登录，每天可免费提问 10 次。
            </p>
            <button
              type="button"
              onClick={AuthApi.login}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-base-text px-5 text-sm font-semibold text-base-bg transition hover:opacity-85"
            >
              <span className="i-carbon-logo-github h-4.5 w-4.5" />
              使用 GitHub 登录
            </button>
          </div>
        )}
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
