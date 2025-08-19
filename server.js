const express = require('express');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(5000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:5000');
  });
});