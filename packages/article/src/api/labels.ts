import { owner, repo } from '../config';
import { stacking } from '../utils/general';
import { instance } from '../utils/request';

export type Root = Root2[];

export interface Root2 {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

const _getLabels = async (page = 1) => {
  const { data } = await instance.get<Root>(`/repos/${owner}/${repo}/labels`, {
    params: {
      accept: 'application/vnd.github+json',
      per_page: 100,
      page,
    },
  });

  return data;
};

/**
 * 返回所有 labels
 *
 */
export const getLabels = () =>
  stacking(_getLabels, (issues) => {
    return issues.length >= 100;
  });
