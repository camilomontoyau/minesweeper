require('./config');

const express = require('express');
const server = express();
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', (req, res) => res.send('hello minesweeper'));

mongoose.connect(
  process.env.URLDB,
  (err, res) => {
    if (err) throw err;
    console.log('DB ONLINE');
  }
);

server.listen(process.env.PORT, () => {
  console.log('Server Online ==> port: ', process.env.PORT);
});
