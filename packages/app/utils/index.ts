import { QUANTITY_PER_PAGE } from '@/constant';
import { problem } from '@blog/pull-data';
import { parse, walk, SyntaxKind } from 'html5parser';
import dayjs from 'dayjs';
import seedrandom from 'seedrandom';

// 传递栏目id获取所有相同id的栏目
export const obtainClassification = (id?: string) => {
  return id ? problem.filter((f) => !!f.labels.find((item) => item.id === +id)) : problem;
};

// 传递详情id获取文章
export const articleDetails = (id: string | number, columnId?: string) => {
  const data = obtainClassification(columnId);

  return data.find((f) => f.id === +id);
};

// 根据html获取图片
export const getImgArr = (html: string) => {
  const ast = parse(html);

  const arr: string[] = [];
  walk(ast, {
    enter: (node) => {
      if (node.end > 150) {
        return;
      }

      if (node.type === SyntaxKind.Tag && node.name === 'img') {
        const href = node.attributes.find((f) => {
          return f.name.value === 'src';
        })?.value?.value;
        if (!href) {
          return;
        }
        arr.push(href);
      }
    },
  });
  return arr;
};

export const getTotal = (data: Array<any>) => {
  return Math.ceil(data.length / QUANTITY_PER_PAGE);
};

const random = (min: number, max: number, seed: number) => {
  const value = seedrandom(`${seed}`).quick();
  const randomNumber = Math.floor(value * (max - min + 1)) + min;
  return randomNumber;
};

// 生成固定随机数
export const noRepeat = (min: number, max: number, arr: Array<string | number>) => {
  // 确保不取到当前的数
  let i = 0;
  const date = Number.parseInt(dayjs().format('YYYYMMDD'));
  let value = random(min, max, date);

  while (arr.find((f) => +f === value) !== undefined) {
    value = random(min, max, date + ++i);
  }

  return value;
};
