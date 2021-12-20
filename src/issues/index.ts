import axios from 'axios';

const USER = 'bosens-China';
const WAREHOUSE_NAME = 'blog';

const defaultParams = {
  // 过滤条件自己创建
  filte: 'created',
  // 只查找打开问题
  state: 'open',
  // 排序以更新时间为主
  sort: 'updated',
  // 最大请求为100
  per_page: 100,
};

export interface Label {
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

export interface Values {
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
  assignee: null;
  assignees: any[];
  milestone: null;
  comments: number;
  created_at: Date;
  updated_at: Date;
  closed_at: null;
  author_association: string;
  active_lock_reason: null;
  body: string;
  reactions: Reactions;
  timeline_url: string;
  performed_via_github_app: null;
  pull_request: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    merged_at: null;
  };
}

const getIssues = async (page = 1) => {
  const { data } = await axios.get<Array<Values>>(`https://api.github.com/repos/${USER}/${WAREHOUSE_NAME}/issues`, {
    params: { page, ...defaultParams },
  });
  return data;
};

const getIssuesAll = async () => {
  const issuesList: Array<Values> = [];
  for (let i = 1; true; i++) {
    const list = await getIssues(i);
    // 如果不存在属性跳出循环
    if (!list.length) {
      break;
    }
    issuesList.push(...list.filter((f) => !f.pull_request));
  }

  return issuesList;
};

export default getIssuesAll;
