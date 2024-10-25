import fs from 'fs-extra';

if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', '');
}
