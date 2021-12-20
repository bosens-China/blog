import prettier from 'prettier';
import dayjs from 'dayjs';
import { configure } from 'nunjucks';
import 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

dayjs.locale('zh-cn');

export const format = (md: string) => {
  return prettier.format(md, { parser: 'markdown' });
};

export const getTime = () => {
  return dayjs.utc().local().format('YYYY-MM-DD HH:mm');
};

export const render = <T extends object>(template: string, options: T) => {
  const env = configure({ trimBlocks: true, lstripBlocks: true });
  const value = env.renderString(template, options);
  return value;
};
