import prettier from 'prettier';

import { configure } from 'nunjucks';

export const format = (md: string) => {
  return prettier.format(md, { parser: 'markdown' });
};

export const render = <T extends object>(template: string, options: T) => {
  const env = configure({ trimBlocks: true, lstripBlocks: true });
  const value = env.renderString(template, options);
  return value;
};
