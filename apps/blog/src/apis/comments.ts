import { apiJson } from './client';

export interface CommentUser {
  id: number;
  login: string;
  avatar_url: string | null;
  profile_url: string | null;
}

export interface BlogComment {
  id: number;
  post_id: number;
  body: string;
  created_at: string;
  updated_at: string;
  user: CommentUser;
  is_author: boolean;
  is_me: boolean;
  status: 'approved' | 'pending' | 'rejected';
  reply_to?: Pick<CommentUser, 'id' | 'login'>;
  replies?: BlogComment[];
}

export const CommentsApi = {
  list: (postId: number) =>
    apiJson<BlogComment[]>(`/api/posts/${postId}/comments`),

  create: (postId: number, body: string, replyToCommentId?: number) =>
    apiJson<BlogComment>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        body,
        ...(replyToCommentId ? { reply_to_comment_id: replyToCommentId } : {}),
      }),
    }),
};
