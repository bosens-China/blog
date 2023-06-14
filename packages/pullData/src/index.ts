import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import path from 'path';

import { obtainingQuestions } from './api';

const dir = path.resolve(fileURLToPath(import.meta.url), '../data');

console.time(`爬取数据结束`);
const [problem] = await Promise.all([obtainingQuestions()]);
await fs.outputJSON(path.resolve(dir, 'problem.json'), problem, {
  spaces: 2,
});
console.timeEnd(`爬取数据结束`);
