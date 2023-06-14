import axios from 'axios';
import { owner, repo } from '../config';

const instance = axios.create({
  baseURL: 'https://api.github.com',
  // timeout: 10000,
});

// 获取所有问题
export const obtainingQuestions = async (page = 1) => {
  type Root = Root2[];
  interface Root2 {
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
    reactions: Reactions;
    timeline_url: string;
    performed_via_github_app: any;
    state_reason: any;
  }

  interface User {
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

  interface Label {
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description: string;
  }

  interface Reactions {
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

  const { data } = await instance.get<Root>(`/repos/${owner}/${repo}/issues`, {
    params: {
      state: 'open',
      creator: owner,
      page,
    },
  });
  if (data.length) {
    data.push(...(await obtainingQuestions(page + 1)));
  }
  return data;
};
