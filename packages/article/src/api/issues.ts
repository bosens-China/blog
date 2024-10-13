import { owner, repo } from '../config';
import { stacking } from '../utils/general';
import { instance } from '../utils/request';

export type Root = Root2[];

export interface Root2 {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: User;
  labels: Label[];
  state: string;
  locked: boolean;
  assignee: any;
  assignees: any[];
  milestone: any;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: any;
  author_association: string;
  active_lock_reason: any;
  body?: string;
  closed_by: any;
  reactions: Reactions;
  timeline_url: string;
  performed_via_github_app: any;
  state_reason: any;
}

export interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

export interface Reactions {
  url: string;
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

const _getIssues = async (page = 1) => {
  const { data } = await instance.get<Root>(`/repos/${owner}/${repo}/issues`, {
    params: {
      accept: 'application/vnd.github+json',
      filter: 'created',
      state: 'open',
      sort: 'updated',
      // direction: 'asc',
      per_page: 100,
      page,
    },
  });

  return data;
};

/**
 * 返回所有issues
 *
 */
export const getIssues = () =>
  stacking(_getIssues, (issues) => {
    return issues.length >= 100;
  });
