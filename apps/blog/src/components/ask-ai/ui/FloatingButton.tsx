import React from 'react';

interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const AiChatIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 现代极简对话框边框 */}
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    {/* 内部 4 角星 AI Sparkle 元素 */}
    <path
      d="M12 7c0 2.5-1.5 4-4 4 2.5 0 4 1.5 4 4 0-2.5 1.5-4 4-4-2.5 0-4-1.5-4-4z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export function FloatingButton({ isOpen, onClick }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed z-40 flex items-center justify-center rounded-xl bg-base-bg border border-base-border text-base-text-light shadow-sm hover:text-primary hover:border-primary/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group w-10 h-10 md:w-11 md:h-11 right-[max(1.5rem,env(safe-area-inset-right,0px))] md:right-8 bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:bottom-8 ${
        isOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100'
      }`}
      aria-label="Ask AI"
    >
      <AiChatIcon className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110" />
      <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-base-text text-base-bg text-xs px-2 py-1 rounded shadow-sm opacity-90 whitespace-nowrap font-mono tracking-tight">
        Ask AI
      </span>
    </button>
  );
}
