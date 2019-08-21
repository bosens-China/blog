const express = require('express');
const app = express();
const superagent = require('superagent');
const v = require('./analysis');


let server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Your App is running at http://%s:%s', host, port);

  superagent.get('https://github.com/bosens-China/blog/issues').end((err, t) => {
    if (err) {
      return;
    }
    app.get('/', function (req, res) {
      res.send(t.text);
    });
    v(t.text);

    


  });
});

