const cheerio = require('cheerio')
// const superagent = require('superagent');
// let $;
// // 解析
// const url = 'https://github.com/vuejs/vue/issues';
// module.exports = async function(content = '') {
//   const con = {};
//   $ = cheerio.load(content);
//   const page = $('.paginate-container .pagination .current');
//   console.log(page.attr('data-total-pages'));
//   return;
//   if(page) {
//     const requests = [];
//     for(let i = 2; i <= page; i++) {
//       requests.push(superagent.get(url).query({page: i}));
//     }    
//     try {
//       const v = await Promise.all(requests);
//       console.log(v);

//     }catch(e) {
//       console.log(e);

//     }

//   }

// };
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
  async getAllContent({
    page,
    current
  } = {}) {
    const arr = [];
    for (let i = current; i <= page; i++) {
      arr.push(this.getContent({page: i}));
    }
    
    return Promise.all(arr);
  }

}
module.exports = myIssues;