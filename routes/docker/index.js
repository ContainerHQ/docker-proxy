var _ = require('underscore'),
  express = require('express'),
  es = require('event-stream'),
  api = require('./api'),
  docker = require('../../lib/docker');

let router = express.Router();

function setStreaming(req, res, next) {
  req.isStreaming = true;
  next();
}

router
  .post('/build', setStreaming)
  .post('/images/load', setStreaming)
  .use((req, res, next) => {
    req.proxy = new docker.Proxy(req);
    next();
  })
  .get('/version', (req, res) => {
    req.proxy.redirect()
      .pipe(es.split())
      .pipe(es.parse())
      .pipe(es.map((data, cb) => {
        data.ApiVersion += ' (Docker Proxy)';
        res.send(data);
      }));
  });

for (let method of Object.keys(api)) {
  for (let route of api[method]) {
    router[method](route, (req, res) => {
      req.proxy.redirect().pipe(res);
    });
  }
}

module.exports = router;