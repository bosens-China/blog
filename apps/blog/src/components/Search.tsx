import React, { useState, useEffect, useRef, useCallback } from 'react';

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

  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
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

  const openSearch = useCallback(() => {
    setIsOpen(true);
    // 原生 dialog 会自动聚焦首个输入框
    void initPagefind();
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
  }, []);

  const toggleSearch = useCallback(() => {
    if (isOpen) closeSearch();
    else openSearch();
  }, [closeSearch, isOpen, openSearch]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

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

      if (e.key === 'Escape') {
        closeSearch();
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
          closeSearch();
        } else if (results.length > 0) {
          // 如果没有选中任何项，默认跳转第一个
          window.location.href = results[0].data.url;
          closeSearch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSearch, isOpen, toggleSearch, results, selectedIndex]);

  // 当选中项改变时，自动滚动到可见区域
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // 执行搜索
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    // 标记本次 effect 是否已被后续输入取代，丢弃过期响应，避免慢响应覆盖快响应
    let cancelled = false;

    const search = async () => {
      setLoading(true);
      try {
        // 确保搜索引擎已就绪：首次输入可能早于 pagefind 异步加载完成
        await initPagefind();
        if (cancelled || !window.pagefind) return;

        const searchResult = await window.pagefind.search(query);
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
        if (cancelled) return; // 丢弃过期响应
        setResults(processedResults);
        setSelectedIndex(-1); // 重置选中项
      } catch (e) {
        if (!cancelled) console.error('搜索失败：', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timer = setTimeout(search, 300); // 防抖
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const modalContent = (
    <dialog
      ref={dialogRef}
      aria-labelledby="search-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] m-0 h-full w-full max-h-none max-w-none border-0 bg-black/40 p-0 backdrop-blur-sm dark:bg-black/60 animate-fade-in"
      onCancel={(event) => {
        event.preventDefault();
        closeSearch();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeSearch();
      }}
    >
      <h2 id="search-dialog-title" className="sr-only">
        搜索文章
      </h2>
      <div className="mx-auto mt-20 w-[calc(100%-2rem)] max-w-2xl bg-base-bg border border-base-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-zoom-in md:mt-[15vh]">
        <div className="flex items-center px-4 border-b border-base-border">
          <div className="i-carbon-search w-5 h-5 text-muted mr-3"></div>
          <input
            type="text"
            aria-label="搜索文章"
            className="flex-1 h-14 bg-transparent outline-none text-lg text-base-text placeholder:text-muted"
            placeholder="搜索文章..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="i-carbon-circle-dash w-5 h-5 animate-spin text-muted"></div>
          )}
        </div>

        <div className="overflow-y-auto p-2">
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
                      closeSearch();
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

        <div className="px-4 py-2 border-t border-base-border bg-base-fill flex justify-between items-center text-xs text-muted">
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
    </dialog>
  );

  return (
    <>
      <button
        type="button"
        onClick={toggleSearch}
        className="h-9 px-2 rounded-lg hover:bg-base-hover transition-colors focus:outline-none flex items-center gap-2 text-base-text-light hover:text-primary-text"
        aria-label="搜索文章"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="i-carbon-search w-5 h-5"></div>
        <span className="hidden md:block text-xs border border-base-border px-1.5 py-0.5 rounded text-muted">
          {shortcutSymbol} K
        </span>
      </button>

      {modalContent}
    </>
  );
}
