const fs = require('fs-extra');
const dayjs = require('dayjs');
const path = require('path');
const utc = require('dayjs/plugin/utc');
const nodemailer = require('nodemailer');
const ajax = require('./utils/ajax');
const { ISSUES, USER } = require('./API');
// 加载中文时区
require('dayjs/locale/zh-cn');

dayjs.extend(utc);
dayjs.locale('zh-cn');

const SRC = path.resolve(__dirname, '../README.md');
const defaultIem = '其他';
// 替换标识
const REPLACE = '## content';
const params = {
  page: 1,
  state: 'open',
  per_page: 20,
};

// 获取ISSUES文章
async function getBlog() {
  const data = await ajax({
    url: ISSUES,
    data: params,
  });
  params.page += 1;
  return data;
}
// 获取全部
async function getBlogWhole() {
  const arr = [];
  let data = [];
  // 因为github的api没有返回总数，必须要调用循环一次次的循环
  do {
    // eslint-disable-next-line no-await-in-loop
    data = await getBlog();
    arr.push(...data);
  } while (Array.isArray(data) && data.length);
  return arr;
}
// 将返回数据转化为需要格式
function Transformation(arr) {
  if (!Array.isArray(arr)) {
    return [];
  }
  // 过滤用户
  const data = arr.filter((f) => {
    const { user: { login } = {} } = f;
    return login === USER;
  });
  // 排序数组
  data.sort((x, y) => x.number - y.number);
  console.dir(`读取api完成，当前文章总数为：${data.length} 篇`);
  // 把所有的标签提取出来
  const label = new Map();
  for (const item of data) {
    const {
      title, html_url: url, number: sort, id, labels,
    } = item;
    const obj = {
      id,
      title,
      url,
      sort,
    };
    // 如果是0加入到其他中
    if (!labels.length) {
      if (!label.has(defaultIem)) {
        label.set(defaultIem, []);
      }
      label.get(defaultIem).push(obj);
    } else {
      labels.forEach((f) => {
        const { name } = f;
        if (!label.has(name)) {
          label.set(name, []);
        }
        label.get(name).push(obj);
      });
    }
  }
  return label;
}

// 备份文件
async function eecord() {
  // utc的时间，不过需要加上8h，因为北京时间是+8的utc
  const date = dayjs.utc();
  const time = date.add(8, 'h').format('YYYY年MM月DD日HH时mm分ss秒');
  const destPath = path.resolve(__dirname, `../eecord/${time}.md`);
  await fs.copy(SRC, destPath);
  // 读取json文件
  const jsonPath = path.resolve(__dirname, '../eecord/time.json');
  const json = await fs.readJson(jsonPath);
  const { content } = json;
  content.push({
    id: content.length + 1,
    name: `${time}.md`,
    createdTime: +date,
    createdTimeText: date.format('YYYY-MM-DD HH:mm:ss'),
    path: destPath,
  });
  // 超出30篇，删除之前的
  if (content.length > 30) {
    const deleFile = content.splice(0, content.length - 30).map((f) => {
      const { path: p } = f;
      return fs.unlink(p);
    });
    await Promise.all(deleFile);
  }

  await fs.writeJson(jsonPath, json, {
    spaces: 2,
  });
}
async function setFile(blog) {
  // 读入一下模板文件
  const tem = path.resolve(__dirname, './template/index.md');
  let content = '';
  for (const [name, value] of blog) {
    const v = value
      .map((f, index) => {
        const { title, url } = f;
        return `${index + 1}. [${title}](${url})`;
      })
      .join('\n');
    content += `\n## ${name}\n${v}\n`;
  }
  content = content.trim();
  const temContent = await fs.readFile(tem, 'utf8');
  content = temContent.replace(REPLACE, content);
  await fs.outputFile(SRC, content, {});
}
// 发送邮件
function sendMail(e) {
  const mailTransport = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secureConnection: true,
    auth: {
      user: '1123598783@qq.com',
      pass: 'vbwjzecplhehibed',
    },
  });
  const options = {
    from: '1123598783@qq.com',
    to: '1123598783@qq.com',
    subject: 'github blog更新文章失败',
    text: e instanceof Error ? e.message : e,
  };
  mailTransport.sendMail(options);
}
(async () => {
  const blog = Transformation(await getBlogWhole());
  await eecord();
  await setFile(blog);
})().catch((e) => {
  sendMail(e);
});
