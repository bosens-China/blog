import { issues } from 'article';
import { load } from 'cheerio';
// import * as _ from 'lodash-es';

/*
 * 根据标签返回所有相关的文章
 */
export const getLabelArticles = (labelsId: number) => {
  return issues.filter((f) => f.labels.some((f) => f.id === labelsId));
};

/*
 * 根据html来返回所有的img标签
 */
export const getImgList = (html: string) => {
  const $ = load(html);
  const imgList = $('img').toArray();
  return imgList.map((f) => $(f).attr('src'));
};
