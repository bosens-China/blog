import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1); // 当前选中的结果索引
  const [shortcutSymbol, setShortcutSymbol] = useState('Ctrl');
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setMounted(true);
    // 检测操作系统以显示正确的快捷键符号
    if (typeof navigator !== 'undefined') {
      const isMac = /Mac|iPod|iPhone|iPad/i.test(navigator.userAgent);
      setShortcutSymbol(isMac ? '⌘' : 'Ctrl');
    }
  }, []);

  // 初始化 Pagefind
  const initPagefind = async () => {
    if (window.pagefind) return;
    try {
      // 这里的注释是为了防止 Vite 在构建时尝试解析这个仅在运行时存在的资源
      // @ts-ignore
      const pagefind = await import('/pagefind/pagefind.js');
      window.pagefind = pagefind;
      await window.pagefind?.init?.();
    } catch (e) {
      console.warn('页面查找搜索不可用', e);
    }
  };

  const toggleSearch = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        // 打开时聚焦输入框并初始化搜索引擎
        setTimeout(() => inputRef.current?.focus(), 100);
        initPagefind();
        document.body.style.overflow = 'hidden';
      } else {
        // 关闭时重置状态
        setQuery('');
        setResults([]);
        setSelectedIndex(-1);
        document.body.style.overflow = '';
      }
      return !prev;
    });
  }, []);

  // 处理键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 切换搜索框: Meta+K 或 Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
        return;
      }

      if (!isOpen) return;

      // ESC 关闭
      if (e.key === 'Escape') {
        toggleSearch();
        return;
      }

      // 下箭头：选择下一个
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev + 1;
          return next >= results.length ? 0 : next;
        });
      }

      // 上箭头：选择上一个
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? results.length - 1 : next;
        });
      }

      // 回车：跳转
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          const url = results[selectedIndex].data.url;
          window.location.href = url;
          toggleSearch();
        } else if (results.length > 0) {
          // 如果没有选中任何项，默认跳转第一个
          window.location.href = results[0].data.url;
          toggleSearch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleSearch, results, selectedIndex]);

  // 当选中项改变时，自动滚动到可见区域
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // 点击遮罩层关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      toggleSearch();
    }
  };

  // 执行搜索
  useEffect(() => {
    if (!query.trim() || !window.pagefind) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const searchResult = await window.pagefind!.search(query);
        // 仅加载前 8 个结果以保证性能
        const processedResults = await Promise.all(
          searchResult.results.slice(0, 8).map(async (r) => {
            const data = await r.data();

            // 手动处理标题高亮：因为 Pagefind 不会自动高亮 meta.title
            const title = escapeHtml(
              String(data.meta?.title || data.url || ''),
            );
            const escapedQuery = escapeHtml(query).replace(
              /[.*+?^${}()|[\]\\]/g,
              '\\$&',
            );
            const regex = new RegExp(`(${escapedQuery})`, 'gi');
            const highlightedTitle = title.replace(
              regex,
              '<mark class="bg-yellow-200 dark:bg-yellow-800 text-inherit px-0.5 rounded-sm">$1</mark>',
            );

            return {
              ...r,
              data: {
                ...data,
                highlightedTitle, // 将处理后的标题传递给组件
              },
            };
          }),
        );
        setResults(processedResults);
        setSelectedIndex(-1); // 重置选中项
      } catch (e) {
        console.error('搜索失败：', e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300); // 防抖
    return () => clearTimeout(timer);
  }, [query]);

  const modalContent = isOpen && (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 md:pt-[15vh] px-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-base-bg border border-base-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-base-border">
          <div className="i-carbon-search w-5 h-5 text-muted mr-3"></div>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 h-14 bg-transparent outline-none text-lg text-base-text placeholder:text-muted"
            placeholder="搜索文章..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="i-carbon-circle-dash w-5 h-5 animate-spin text-muted"></div>
          )}
        </div>

        <div className="overflow-y-auto p-2 scrollbar-hide">
          {results.length > 0 ? (
            <ul ref={listRef} className="space-y-1">
              {results.map((result, index) => (
                <li key={result.id}>
                  <a
                    href={result.data.url}
                    className={`block p-3 rounded-lg transition-colors group ${
                      index === selectedIndex
                        ? 'bg-base-hover'
                        : 'hover:bg-base-hover'
                    }`}
                    onClick={() => {
                      toggleSearch();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-base font-medium ${index === selectedIndex ? 'text-primary' : 'text-primary-text group-hover:text-primary'}`}
                        dangerouslySetInnerHTML={{
                          __html: result.data.highlightedTitle,
                        }}
                      />
                    </div>
                    <p
                      className="text-sm text-muted line-clamp-2 text-ellipsis"
                      dangerouslySetInnerHTML={{ __html: result.data.excerpt }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="text-center py-10 text-muted">
              {loading ? '搜索中...' : '没有找到相关内容'}
            </div>
          ) : (
            <div className="text-center py-10 text-muted text-sm">
              输入关键词搜索文章标题或内容
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-base-border bg-base-fill/50 flex justify-between items-center text-xs text-muted">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-base-bg border border-base-border px-1 rounded">
                ↵
              </kbd>{' '}
              选定
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-base-bg border border-base-border px-1 rounded">
                ↓
              </kbd>{' '}
              <kbd className="font-mono bg-base-bg border border-base-border px-1 rounded">
                ↑
              </kbd>{' '}
              导航
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-base-bg border border-base-border px-1 rounded">
                esc
              </kbd>{' '}
              关闭
            </span>
          </div>
          <div className="opacity-50">Pagefind</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={toggleSearch}
        className="h-9 px-2 rounded-lg hover:bg-base-hover transition-colors focus:outline-none flex items-center gap-2 text-base-text-light hover:text-primary-text"
        aria-label="Search"
      >
        <div className="i-carbon-search w-5 h-5"></div>
        <span className="hidden md:block text-xs border border-base-border px-1.5 py-0.5 rounded text-muted">
          {shortcutSymbol} K
        </span>
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
