import React from 'react';
import sparklesIcon from '@/icons/sparkles.svg?raw';

interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function FloatingButton({ isOpen, onClick }: FloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-floating z-40 right-[max(1.5rem,env(safe-area-inset-right,0px))] md:right-8 bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:bottom-8 ${
        isOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100'
      }`}
      aria-label="向 AI 提问"
      title="向 AI 提问"
    >
      <span
        className="flex w-4.5 h-4.5 [&>svg]:w-full [&>svg]:h-full"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: sparklesIcon }}
      />
    </button>
  );
}
