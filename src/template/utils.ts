import prettier from 'prettier';

export const format = (md: string) => {
  return prettier.format(md, { parser: 'markdown' });
};
