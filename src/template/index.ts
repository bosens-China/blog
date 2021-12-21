import { Values } from '../issues';
import path from 'path';
import fs from 'fs-extra';
import { format, render } from './utils';

interface Type {
  url: string;
  title: string;
}

const README_TEMPLATE = fs.readFileSync(path.join(__dirname, './readme.njk'), 'utf-8');

/*
 * 将接口内容转化为Array<{url, title}>
 * 方便后续使用
 */
const getContent = (list: Array<Values>) => {
  const especially = '其他';
  const content: Map<string, Array<Type>> = new Map();
  for (const { labels, html_url: url, title } of list) {
    const type = labels.length ? labels.map((f) => f.name) : [especially];
    type.forEach((item) => {
      if (!content.has(item)) {
        content.set(item, []);
      }
      const arr = content.get(item)!;
      arr.push({
        url,
        title,
      });
    });
  }
  return content;
};

export interface ReadmeOptions {
  title: string;
  data: Array<Type>;
}

// 传递给README.njk的值
interface TransmitReadme {
  data: Array<ReadmeOptions>;
}

const output = (content: Map<string, Type[]>) => {
  const arr: Array<ReadmeOptions> = [];
  const typeFile: Array<Promise<any>> = [];
  for (const [name, values] of content) {
    if (!values.length) {
      continue;
    }
    arr.push({ title: name, data: values });
  }
  const transmitReadme: TransmitReadme = {
    data: arr,
  };
  const mdStr = render(README_TEMPLATE, transmitReadme);
  const md = format(mdStr);
  typeFile.push(fs.outputFile(path.join(process.cwd(), 'README.md'), md));
  return typeFile;
};

const run = async (list: Array<Values>) => {
  const content = getContent(list);
  await output(content);
};

export default run;
