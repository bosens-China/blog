import { useCallback, useEffect, useState } from 'react';
import { AuthApi, type CurrentUser } from '@/apis/auth';
import { CommentsApi, type BlogComment } from '@/apis/comments';
import { isServiceHealthy } from '@/apis/health';
import { PushApi } from '@/apis/push';
import AuthMenu from '@/components/auth/AuthMenu';
import { useAuth } from '@/hooks/useAuth';
import CommentThread from './CommentThread';

interface CommentSectionProps {
  postId: number;
}

const MAX_LENGTH = 2000;

function normalizeComment(comment: BlogComment): BlogComment {
  return {
    ...comment,
    ...(comment.replies
      ? { replies: comment.replies.map(normalizeComment) }
      : {}),
  };
}

function countComments(comments: BlogComment[]) {
  return comments.reduce(
    (total, comment) => total + 1 + (comment.replies?.length ?? 0),
    0,
  );
}

function canViewComment(comment: BlogComment, user: CurrentUser | null) {
  return (
    comment.status === 'approved' ||
    comment.user.id === user?.id ||
    Boolean(user?.is_author)
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const currentUser = user ?? null;
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!(await isServiceHealthy('comments'))) {
        throw new Error('评论服务暂时不可用');
      }
      setComments((await CommentsApi.list(postId)).map(normalizeComment));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '评论加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (
      currentUser &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      void PushApi.ensureSubscribed();
    }
  }, [currentUser]);

  const submitComment = async () => {
    const content = body.trim();
    if (!currentUser || !content || isSubmitting) return;
    void PushApi.ensureSubscribed();
    setIsSubmitting(true);
    setError('');
    try {
      const comment = normalizeComment(
        await CommentsApi.create(postId, content),
      );
      setComments((current) => [comment, ...current]);
      setBody('');
      setSubmitted(comment.status === 'pending');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '评论提交失败',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addReply = async (
    rootId: number,
    target: BlogComment,
    content: string,
  ) => {
    const reply = normalizeComment(
      await CommentsApi.create(postId, content, target.id),
    );
    setComments((current) =>
      current.map((comment) =>
        comment.id === rootId
          ? {
              ...comment,
              replies: [
                ...(comment.replies ?? []),
                {
                  ...reply,
                  reply_to: reply.reply_to ?? {
                    id: target.user.id,
                    login: target.user.login,
                  },
                },
              ],
            }
          : comment,
      ),
    );
  };

  const visibleComments: BlogComment[] = comments
    .filter((comment) => canViewComment(comment, currentUser))
    .map((comment) =>
      comment.replies
        ? {
            ...comment,
            replies: comment.replies.filter((reply) =>
              canViewComment(reply, currentUser),
            ),
          }
        : comment,
    );

  return (
    <section
      aria-labelledby={`comments-${postId}`}
      className="mt-20 border-t border-base-border pt-12"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2
          id={`comments-${postId}`}
          className="text-xl font-bold text-base-text"
        >
          评论
          {!isLoading && (
            <span className="ml-2 text-sm font-normal text-base-text-light">
              {countComments(visibleComments)}
            </span>
          )}
        </h2>
        <p className="hidden text-xs text-base-text-light sm:block">
          每小时最多发布 10 条评论或回复
        </p>
      </div>

      {currentUser ? (
        <div className="mb-9 rounded-2xl border border-base-border bg-base-fill/40 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-base-text">参与讨论</p>
              <p className="mt-0.5 text-xs text-base-text-light">
                {currentUser.is_author
                  ? '正在以作者身份回复'
                  : '请保持友善交流，评论通常会在一小时内完成审核'}
              </p>
            </div>
            <AuthMenu align="right" showName />
          </div>
          <textarea
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              setSubmitted(false);
            }}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder="写下你的想法，可使用 @用户名 提及本文评论者……"
            className="min-h-28 w-full resize-y rounded-xl border border-base-border bg-base-bg px-4 py-3 text-sm leading-relaxed text-base-text outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs tabular-nums text-base-text-light">
              {submitted
                ? '已提交，审核通过后将公开展示'
                : `${body.length} / ${MAX_LENGTH}`}
            </span>
            <button
              type="button"
              onClick={submitComment}
              disabled={!body.trim() || isSubmitting}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSubmitting && (
                <span className="i-carbon-circle-dash h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? '提交中' : '发表评论'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-9 flex flex-col items-center rounded-2xl border border-dashed border-base-border bg-base-fill/30 px-6 py-8 text-center">
          <span className="i-carbon-chat h-7 w-7 text-base-text-light" />
          <h3 className="mt-3 text-sm font-semibold text-base-text">
            参与这篇文章的讨论
          </h3>
          <p className="mt-1 text-xs text-base-text-light">
            使用 GitHub 登录后即可评论和回复
          </p>
          <button
            type="button"
            onClick={AuthApi.login}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-base-text px-4 text-sm font-semibold text-base-bg transition hover:opacity-85"
          >
            <span className="i-carbon-logo-github h-4.5 w-4.5" />
            使用 GitHub 登录
          </button>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-base-border bg-base-fill/40 px-4 py-3 text-sm text-base-text-light">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadComments}
            className="shrink-0 text-primary-text hover:underline"
          >
            重试
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 py-4" aria-label="正在加载评论">
          <div className="h-24 animate-pulse rounded-xl bg-base-fill" />
          <div className="h-24 animate-pulse rounded-xl bg-base-fill" />
        </div>
      ) : (
        <div className="divide-y divide-base-border/70">
          {visibleComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onReply={(target, content) =>
                addReply(comment.id, target, content)
              }
            />
          ))}
          {!visibleComments.length && !error && (
            <p className="py-10 text-center text-sm text-base-text-light">
              暂无评论，来聊聊你的想法吧。
            </p>
          )}
        </div>
      )}
    </section>
  );
}
