import { Values } from '../issues';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs-extra';
import json from '../../test.json';
import { format } from './utils';

interface Type {
  url: string;
  title: string;
}

const MAX_LENGTH = 10;
const baseDir = path.join(process.cwd(), 'docs');
const README_TEMPLATE = fs.readFileSync(path.join(__dirname, './readme.ejs'), 'utf-8');
const TYPE_TEMPLATE = fs.readFileSync(path.join(__dirname, './type.ejs'), 'utf-8');

/*
 * 将接口内容转化为Array<{url, title}>
 * 方便后续使用
 */
const getContent = (list: Array<Values>) => {
  const especially = '其他';
  const content: Map<string, Array<Type>> = new Map([[especially, []]]);
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

interface ReadmeOptions {
  title: string;
  more: boolean;
  fileName: string;
  data: Array<Type>;
}

const output = (content: Map<string, Type[]>) => {
  const arr: Array<ReadmeOptions> = [];
  fs.removeSync(baseDir);
  const typeFile: Array<Promise<any>> = [];
  for (const [name, values] of content) {
    if (/(^\s+|\s+$)/.test(name)) {
      console.warn(`blog:${name}存在首行或者尾部空白！`);
    }
    const title = name.replace(/(^\s+|\s+$)/g, '');
    if (!values.length) {
      continue;
    }
    const list = values.slice(0, MAX_LENGTH);
    const more = values.length > MAX_LENGTH;
    const fileName = name.replace(/\s/g, '') + '.md';
    arr.push({ title, fileName, more, data: list });
    /*
     * 输出
     */
    const typeStr = ejs.render(TYPE_TEMPLATE, { title, data: values }, { rmWhitespace: true });
    const typeMd = format(typeStr);
    typeFile.push(fs.outputFile(path.join(baseDir, fileName), typeMd));
  }
  const mdStr = ejs.render(README_TEMPLATE, { data: arr });
  const md = format(mdStr);
  typeFile.push(fs.outputFile(path.join(process.cwd(), 'README.md'), md));
  return typeFile;
};

const run = async (list: Array<Values>) => {
  const content = getContent(list);
  await output(content);
};

run(json as any);
