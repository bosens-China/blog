import { issues } from 'article';
// import * as _ from 'lodash-es';

/*
 * 根据标签返回所有相关的文章
 */
export const getLabelArticles = (labelsId: number) => {
  return issues.filter((f) => f.labels.some((f) => f.id === labelsId));
};
