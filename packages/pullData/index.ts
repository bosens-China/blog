import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import path from 'path';
import { marked } from 'marked';
import { obtainingQuestions, allLabels } from './api';

const dir = path.resolve(fileURLToPath(import.meta.url), '../data');

(async () => {
  console.time(`爬取数据结束`);
  const [problem, labels] = await Promise.all([obtainingQuestions(), allLabels()]);
  let userData;
  await Promise.all([
    fs.outputJSON(
      path.resolve(dir, 'problem.json'),
      problem.map((item) => {
        const { user, ...rest } = item;
        userData = user;
        return {
          ...rest,
          html: marked(item.body || '', {
            mangle: false,
            headerIds: false,
          }),
        };
      }),
      {
        spaces: 2,
      },
    ),
    fs.outputJSON(path.resolve(dir, 'labels.json'), labels, {
      spaces: 2,
    }),
    fs.outputJSON(path.resolve(dir, 'user.json'), userData || {}, {
      spaces: 2,
    }),
  ]);

  console.timeEnd(`爬取数据结束`);
})();
