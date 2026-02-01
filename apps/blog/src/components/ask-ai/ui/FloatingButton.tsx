import React from 'react';

interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function FloatingButton({ isOpen, onClick }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 z-40 flex items-center justify-center w-11 h-11 rounded-xl bg-base-bg border border-base-border text-base-text-light shadow-sm hover:text-primary hover:border-primary/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group ${
        isOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100'
      }`}
      aria-label="Ask AI"
    >
      <div className="i-carbon-chat-bot w-6 h-6 transition-transform group-hover:scale-110" />
      <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-base-text text-base-bg text-xs px-2 py-1 rounded shadow-sm opacity-90 whitespace-nowrap font-mono tracking-tight">
        Ask AI
      </span>
    </button>
  );
}
