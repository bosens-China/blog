const cheerio = require('cheerio')
const superagent = require("superagent")

class myIssues {
  constructor(url) {
    this.url = url;
    this.content = [];
  }

  // 获得内容
  async getContent (query) {
    const v = superagent.get(this.url).query(query);
    return v;
  }
  // 获取页码
  getPage (content) {
    const $ = cheerio.load(content);
    const dom = $('.paginate-container .pagination .current');
    const page = +dom.attr('data-total-pages')
    return page || 0;
  }
  // 获得所有内容
  async getAllContent ({
    page,
    current
  } = {}) {
    const arr = [];
    for (let i = current; i <= page; i++) {
      arr.push(this.getContent({ page: i }));
    }
    return Promise.all(arr);
  }
  // 将内容处理成对象
  getDetails (arr = []) {
    const obj = {
    };
    arr.forEach(fn => {
      const $ = cheerio.load(fn);
      const list = $('.lh-condensed');
      list.each((index, f) => {
        const dom = $(f).find('.no-underline');
        const title = dom.text();
        const href = 'https://github.com' + dom.attr('href');
        const type = dom.next().find('.IssueLabel');
        if (!type.length) {
          if (!obj["其他"]) {
            obj["其他"] = []
          }
          obj["其他"].push({
            href,
            title,
          });
        }
        // 多个标签的情况
        type.each((key, d) => {
          const tags = $(d).text();
          if (!obj[tags]) {
            obj[tags] = [];
          }
          obj[tags].push({
            title,
            href,
          });
        });
      });
    });
    return obj;
  }
  // 生成mkdown的文件
  generate (obj = {}) {
    let text = '';
    for (const [name, value] of Object.entries(obj)) {
      text += `\n## ${name}\n`;
      const arr = value.reverse();
      arr.forEach((item, key) => {
        text += `${key + 1}. [${item.title}](${item.href})\n`;
      });
    }
    return text;
  }

}
module.exports = myIssues;