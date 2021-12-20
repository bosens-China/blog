import path from 'path';
import { cwd } from 'process';

const config = [
  {
    src: path.join(cwd(), './src/main.ts'),
    format: 'cjs',
  },
  {
    src: path.join(cwd(), './src/main.ts'),
    format: 'es',
  },
];

export default config;
