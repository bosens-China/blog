import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { LimitStatus } from '@/apis/askAI';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  isLoading: boolean;
  limitStatus: LimitStatus | null;
  onSend: () => void;
  onStop: () => void;
}

// 格式化时间 mm:ss
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export function ChatInput({
  inputValue,
  setInputValue,
  isLoading,
  limitStatus,
  onSend,
  onStop,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loadingRingRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Reset height when sent
  useEffect(() => {
    if (inputValue === '' && inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [inputValue]);

  // Focus on mount/enable
  useEffect(() => {
    if (!isLoading && !limitStatus?.is_blocked) {
      // Small timeout to ensure DOM is ready or transition finished
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLoading, limitStatus?.is_blocked]);

  // GSAP Animation
  useEffect(() => {
    let ctx: gsap.Context;
    if (isLoading && loadingRingRef.current) {
      ctx = gsap.context(() => {
        gsap.to(loadingRingRef.current, {
          rotation: 360,
          duration: 2,
          repeat: -1,
          ease: 'linear',
        });
        gsap.to(loadingRingRef.current, {
          opacity: 0.8,
          scale: 1.1,
          duration: 0.8,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      });
    }
    return () => {
      ctx?.revert();
      if (loadingRingRef.current) {
        gsap.set(loadingRingRef.current, { rotation: 0, scale: 1, opacity: 0 });
      }
    };
  }, [isLoading]);

  const getPlaceholder = () => {
    if (!limitStatus) {
      return '正在获取服务状态...';
    }
    if (limitStatus.is_blocked) {
      return `系统冷却中，请等待 ${formatTime(limitStatus.remaining_wait_seconds)} 后再试`;
    }
    return '输入你的问题...';
  };

  return (
    <div className="p-5 border-t border-base-border/50 bg-base-bg shrink-0">
      <div
        className={`relative group border border-base-border rounded-xl bg-base-bg overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all shadow-sm ${
          limitStatus?.is_blocked || isLoading || !limitStatus
            ? 'opacity-70 bg-base-bg-dark/5'
            : ''
        }`}
      >
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isLoading || limitStatus?.is_blocked || !limitStatus}
          placeholder={getPlaceholder()}
          rows={1}
          className={`w-full bg-transparent border-none px-4 py-3 pr-12 text-base md:text-sm text-base-text placeholder-base-text-light/50 focus:outline-none resize-none max-h-[120px] scrollbar-hide ${
            limitStatus?.is_blocked || !limitStatus
              ? 'cursor-not-allowed italic'
              : ''
          }`}
          style={{ minHeight: '48px' }}
        />

        {/* 操作按钮容器 */}
        <div className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center">
          {/* GSAP 加载环 - 稍微缩小一点以包围按钮 */}
          <div
            ref={loadingRingRef}
            className="absolute inset-[-2px] rounded-full border-2 border-primary/20 border-t-primary pointer-events-none opacity-0 z-0"
          />

          {isLoading ? (
            <button
              onClick={onStop}
              aria-label="停止生成"
              className="relative w-8 h-8 rounded-full text-error transition-all hover:bg-error/10 active:scale-90 flex items-center justify-center z-10"
            >
              <div className="i-carbon-stop-outline w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onSend}
              aria-label="发送消息"
              disabled={
                !inputValue.trim() || limitStatus?.is_blocked || !limitStatus
              }
              className={`relative w-8 h-8 rounded-full transition-all flex items-center justify-center z-10 active:scale-90 ${
                !inputValue.trim() || limitStatus?.is_blocked || !limitStatus
                  ? 'text-base-text-light/30 bg-transparent cursor-not-allowed'
                  : 'bg-primary text-white shadow-sm hover:bg-primary-600 hover:shadow-md hover:scale-105 hover:brightness-110'
              }`}
            >
              <div className="i-carbon-send-alt w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-3">
        <p className="text-[10px] text-base-text-light/40">
          AI 生成内容仅供参考
        </p>
      </div>
    </div>
  );
}
