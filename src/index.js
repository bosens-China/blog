const express = require('express');
const app = express();
const Issues = require('./Issues');
const config = require('./config');
const issues = new Issues(config.blogUrl);
// const superagent = require('superagent');

// const v = require('./analysis');
// const config = require('./config');


// let server = app.listen(3000, function () {


//   superagent.get(config.blogUrl).end((err, t) => {
//     if (err) {
//       return;
//     }
//     app.get('/', function (req, res) {
//       res.send(t.text);
//     });
//     v(t.text);



//   });
// });
const server = app.listen(3030, async function () {
  const port = server.address().port;
  console.log(`http://localhost:${port}`);
  const {text} = await issues.getContent();
  issues.content.push(text);
  app.get('/', function (re, res) {
    res.send(text);
  });
  const page = issues.getPage(text);
  const value = await issues.getAllContent({
    page,
    current: 2,
  });
  issues.content.push(...value.map(f => f.text));
  // 所有数组添加到一起
  

  
});


