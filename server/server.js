require('./config');

const express = require('express');
const server = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Game = require('./models/game');

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', (req, res) => {
  return res.status(200).json('welcome to minesweeper!');
});

server.get('/games', (req, res) => {
  Game.find(req.query, (err, games) => {
    if (err) return errorHandler(res, err);
    return res.status(200).json(games.map(cleanCells));
  });
});

server.get('/games/:id', (req, res) => {
  Game.findById(req.params.id, (err, game) => {
    if (err) return errorHandler(res, err);
    return res.status(200).json(cleanCells(game));
  });
});

server.put('/games/:id/cell/:x/:y', (req, res) => {
  Game.findById(req.params.id, (err, game) => {
    if (err) return errorHandler(res, err);

    return res.status(200).json(cleanCells(game));
  });
});

server.post('/games', (req, res) => {
  const game = new Game(req.body);
  game.save((err, createdGame) => {
    if (err) return errorHandler(res, err);
    return res.json(cleanCells(createdGame));
  });
});

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

function errorHandler(res, err) {
  console.log('error', err);
  let status = null;
  switch (err.name) {
    case 'ValidationError':
      status = 400;
      break;
    default:
      status = 500;
  }
  return res
    .status(status)
    .json({ error: err.message || 'internal server error' });
}

function cleanCells(game) {
  const responseObject = game.toObject();
  responseObject.board = responseObject.board.map(row => {
    return row.map(cell => {
      const { state } = cell;
      return { state };
    });
  });
  return responseObject;
}
