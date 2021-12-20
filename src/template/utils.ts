import prettier from 'prettier';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

export const format = (md: string) => {
  return prettier.format(md, { parser: 'markdown' });
};

export const getTime = () => {
  return dayjs().format('YYYY-MM-DD HH:mm');
};
