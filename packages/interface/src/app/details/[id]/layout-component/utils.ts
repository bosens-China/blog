import { issues } from 'article';
import { load } from 'cheerio';

export interface Children {
  label: string;
  url: string;
  value: number;
  children?: Children[];
}

export const getToc = (id: string) => {
  let j = 0;
  const issue = issues.find((item) => item.id === +id);

  const tocList: Children[] = [];
  const $ = load(issue?.body_html || '');

  $('h2').each((index, element) => {
    const label = $(element).text();

    const url = $(element).attr('id') || label;
    const obj: Children = { label, url: `#${url}`, children: [], value: j++ };
    tocList.push(obj);
    /*
     * 这里的结构是扁平化的，所以直接查找h2下的h3是找不到的
     */
    let next = $(element).next();
    while (next && next.length) {
      if (next.is('h3')) {
        const label = $(next).text();
        const url = $(next).attr('id') || label;
        obj.children?.push({ label, url: `#${url}`, value: j++ });
      }
      if (next.is('h2')) {
        break;
      }
      next = $(next).next();
    }
  });

  return tocList;
};
