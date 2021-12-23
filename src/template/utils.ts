import prettier from 'prettier';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { configure } from 'nunjucks';
dayjs.locale('zh-cn');

export const format = (md: string) => {
  return prettier.format(md, { parser: 'markdown' });
};

export const render = <T extends object>(template: string, options: T) => {
  const env = configure({ trimBlocks: true, lstripBlocks: true });
  const value = env.renderString(template, options);
  return value;
};

export const getTime = (formatStr = 'YYYY-MM-DD') => {
  if (process.env.GITHUB_TOKEN) {
    const time = dayjs().add(8, 'h');
    return time.format(formatStr);
  }
  return dayjs().format(formatStr);
};
