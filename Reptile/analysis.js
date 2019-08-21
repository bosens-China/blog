const cheerio = require('cheerio')
const superagent = require('superagent');
let $;
// 解析
const url = 'https://github.com/vuejs/vue/issues';
module.exports = async function(content = '') {
  const con = {};
  $ = cheerio.load(content);
  const page = $('.paginate-container .pagination .current');
  console.log(page);
  
  if(page) {
    const requests = [];
    for(let i = 2; i <= page; i++) {
      requests.push(superagent.get(url).query({page: i}));
    }    
    try {
      const v = await Promise.all(requests);
      console.log(v);

    }catch(e) {
      console.log(e);
      
    }
    
  }

};