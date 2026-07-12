import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthMenuProps {
  align?: 'left' | 'right';
  initial?: boolean;
  showName?: boolean;
}

export default function AuthMenu({
  align = 'right',
  initial = false,
  showName = false,
}: AuthMenuProps) {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  if (user === undefined) return <div className="h-9 w-9" />;

  if (!user) {
    return (
      <button
        type="button"
        onClick={login}
        className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-base-text-light transition hover:bg-base-hover hover:text-primary-text"
      >
        <span className="i-carbon-logo-github h-4.5 w-4.5" />
        登录
      </button>
    );
  }

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2 transition hover:bg-base-hover"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt=""
            className="h-6 w-6 rounded-full bg-base-fill"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-base-fill text-xs font-semibold text-base-text">
            {user.login.charAt(0).toUpperCase()}
          </span>
        )}
        {initial && (
          <span className="text-sm font-semibold text-base-text">
            {user.login.charAt(0).toUpperCase()}
          </span>
        )}
        {showName && (
          <span className="max-w-20 truncate text-sm font-medium text-base-text sm:max-w-28">
            {user.login}
          </span>
        )}
        {!initial && (
          <span className="i-carbon-chevron-down h-3 w-3 text-base-text-light" />
        )}
      </button>

      <div
        role="menu"
        className={`absolute top-9 z-60 min-w-32 rounded-xl border border-base-border bg-base-bg p-1.5 shadow-xl ${
          open ? 'block' : 'hidden'
        } ${align === 'left' ? 'left-0' : 'right-0'}`}
      >
        <button
          type="button"
          onClick={async () => {
            await logout();
            setOpen(false);
          }}
          role="menuitem"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
        >
          <span className="i-carbon-logout h-4 w-4" />
          退出登录
        </button>
      </div>
    </div>
  );
}
