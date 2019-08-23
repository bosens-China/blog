const express = require('express');
const app = express();
const Issues = require('./Issues');
const config = require('./config');
// const Issues = require('./Issues');
// const superagent = import('superagent');


// const v = require('./analysis');
// const config = require('./config');


// let server = app.listen(3000, function () {
//   let host = server.address().address;
//   let port = server.address().port;
//   console.log('Your App is running at http://%s:%s', host, port);

//   superagent.get(config.blogUrl).end((err, t) => {
//     if (err) {
//       return;
//     }

//     v(t.text);




//   });
// });
app.listen(3030, function() {
  Issues.
    app.get('/', function (req: any, res: { send: (arg0: string) => void; }) {
      res.send('hello wrold');
    });
});


