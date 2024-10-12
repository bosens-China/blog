import { getIssues } from './api/issues';
import { getLabels } from './api/labels';
import { getUser } from './api/user';
import fs from 'fs-extra';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [issues, labels, user] = await Promise.all([getIssues(), getLabels(), getUser()]);

await Promise.all([
  fs.outputJSON(path.join(__dirname, '../issues.json'), issues, { spaces: 2 }),
  fs.outputJSON(path.join(__dirname, '../labels.json'), labels, { spaces: 2 }),
  fs.outputJSON(path.join(__dirname, '../user.json'), user, { spaces: 2 }),
]);

console.info(`输出完成`);
