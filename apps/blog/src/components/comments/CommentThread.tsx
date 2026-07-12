import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AuthApi, type CurrentUser } from '@/apis/auth';
import type { BlogComment, CommentUser } from '@/apis/comments';
import { PushApi } from '@/apis/push';

interface CommentThreadProps {
  comment: BlogComment;
  currentUser: CurrentUser | null;
  onReply: (target: BlogComment, body: string) => Promise<void>;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function UserAvatar({
  user,
  small = false,
}: {
  user: CommentUser;
  small?: boolean;
}) {
  const size = small ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs';
  return user.avatar_url ? (
    <img
      src={user.avatar_url}
      alt=""
      loading="lazy"
      className={`${size} shrink-0 rounded-full bg-base-fill`}
    />
  ) : (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-base-fill font-semibold text-base-text`}
    >
      {user.login.charAt(0).toUpperCase()}
    </span>
  );
}

function UserName({
  user,
  small = false,
}: {
  user: CommentUser;
  small?: boolean;
}) {
  const className = `${small ? 'text-xs' : 'text-sm'} font-semibold text-base-text`;
  return user.profile_url ? (
    <a
      href={user.profile_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:text-primary-text`}
    >
      {user.login}
    </a>
  ) : (
    <span className={className}>{user.login}</span>
  );
}

function UserBadges({
  comment,
  currentUser,
}: Omit<CommentThreadProps, 'onReply'>) {
  return (
    <>
      {comment.is_author && (
        <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-semibold text-primary-text">
          作者
        </span>
      )}
      {currentUser?.id === comment.user.id && (
        <span className="rounded-full bg-base-fill px-2 py-0.5 text-[10px] font-semibold text-base-text-light">
          我
        </span>
      )}
      {comment.status === 'pending' && (
        <span className="inline-flex items-center gap-1 rounded-full border border-base-border px-2 py-0.5 text-[10px] font-medium text-base-text-light">
          <span className="i-carbon-time h-3 w-3" />
          审核中
        </span>
      )}
      {comment.status === 'rejected' && (
        <span className="rounded-full border border-red-500/30 px-2 py-0.5 text-[10px] font-medium text-red-500">
          未通过审核
        </span>
      )}
    </>
  );
}

function CommentContent({
  comment,
  inline = false,
}: {
  comment: BlogComment;
  inline?: boolean;
}) {
  return (
    <div
      className={`prose prose-sm max-w-none break-words text-base-text dark:prose-invert [&>p]:my-0 ${
        inline ? 'inline [&>p]:inline' : ''
      }`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.body}</ReactMarkdown>
    </div>
  );
}

export default function CommentThread({
  comment,
  currentUser,
  onReply,
}: CommentThreadProps) {
  const [replyTarget, setReplyTarget] = useState<BlogComment | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');

  const startReply = (target: BlogComment) => {
    if (!currentUser) AuthApi.login();
    setReplyError('');
    setReplyTarget(target);
  };

  const submitReply = async () => {
    const body = replyBody.trim();
    if (!replyTarget || !body || isSubmitting) return;
    void PushApi.ensureSubscribed();
    setIsSubmitting(true);
    setReplyError('');
    try {
      await onReply(replyTarget, body);
      setReplyBody('');
      setReplyTarget(null);
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : '回复提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article id={`comment-${comment.id}`} className="scroll-mt-20 py-7">
      <div className="flex gap-3 sm:gap-4">
        <UserAvatar user={comment.user} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <UserName user={comment.user} />
            <UserBadges comment={comment} currentUser={currentUser} />
            <time className="ml-auto text-xs text-base-text-light">
              {formatTime(comment.created_at)}
            </time>
          </div>
          <CommentContent comment={comment} />
          <button
            type="button"
            onClick={() => startReply(comment)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-base-text-light transition hover:text-primary-text"
          >
            <span className="i-carbon-reply h-3.5 w-3.5" />
            回复
          </button>

          {Boolean(comment.replies?.length) && (
            <div className="mt-4 divide-y divide-base-border/60 rounded-xl bg-base-fill/55 px-3 sm:px-4">
              {comment.replies?.map((reply) => (
                <div
                  id={`comment-${reply.id}`}
                  key={reply.id}
                  className="scroll-mt-20 flex gap-3 py-4"
                >
                  <UserAvatar user={reply.user} small />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <UserName user={reply.user} small />
                      <UserBadges comment={reply} currentUser={currentUser} />
                      <time className="ml-auto text-[11px] text-base-text-light">
                        {formatTime(reply.created_at)}
                      </time>
                    </div>
                    <div className="text-sm leading-relaxed text-base-text">
                      {reply.reply_to && (
                        <span className="mr-1 text-base-text-light">
                          回复 {reply.reply_to.login}
                        </span>
                      )}
                      <CommentContent comment={reply} inline />
                    </div>
                    <button
                      type="button"
                      onClick={() => startReply(reply)}
                      className="mt-2 text-xs text-base-text-light transition hover:text-primary-text"
                    >
                      回复
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {replyTarget && currentUser && (
            <div className="mt-4 rounded-xl border border-base-border bg-base-bg p-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs text-base-text-light">
                <span>回复 {replyTarget.user.login}</span>
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  aria-label="取消回复"
                  className="i-carbon-close h-4 w-4 hover:text-base-text"
                />
              </div>
              <textarea
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                maxLength={2000}
                rows={3}
                autoFocus
                placeholder={`回复 ${replyTarget.user.login}，也可使用 @用户名`}
                className="w-full resize-y bg-transparent text-sm leading-relaxed text-base-text outline-none placeholder:text-base-text-light/55"
              />
              {replyError && (
                <p className="mt-2 text-xs text-red-500">{replyError}</p>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-base-border/60 pt-2">
                <span className="text-[11px] text-base-text-light">
                  提交后通常会在一小时内完成审核
                </span>
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={!replyBody.trim() || isSubmitting}
                  aria-label="提交回复"
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isSubmitting ? '提交中' : '回复'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
