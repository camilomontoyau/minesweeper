require('./config');

const express = require('express');
const server = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Game = require('./models/game');

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', express.static(`${__dirname}/static`));

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
  if (!req.body) {
    return errorHandler(res, {
      name: 'ValidationError',
      message: 'body is required'
    });
  }

  if (!req.body.state) {
    return errorHandler(res, {
      name: 'ValidationError',
      message: 'body.state is required'
    });
  }

  const { state } = req.body;
  Game.findById(req.params.id, (err, game) => {
    if (err) return errorHandler(res, err);
    if (game.state === 'lost') return res.status(200).json(game);
    switch (state) {
      case 'opened':
        return openCell(req, res, game);
      case 'flagged':
      case 'question':
        return flagCell({ req, res, game, state });
      default:
        return errorHandler(res, {
          name: 'ValidationError',
          message: 'invalid body.state'
        });
    }
  });
});

server.post('/games', (req, res) => {
  const { state, ...restProps } = req.body;
  if (
    !!restProps.mines &&
    !!restProps.width &&
    !!restProps.height &&
    Number(restProps.mines) > Number(restProps.height) * Number(restProps.width)
  ) {
    return errorHandler(res, {
      name: 'ValidationError',
      message: `number of mines (${
        restProps.mines
      }) can not be higher than number cells (${Number(restProps.width) *
        Number(restProps.height)})`
    });
  }

  if (
    !!restProps.mines &&
    !restProps.width &&
    !restProps.height &&
    Number(restProps.mines) > 9
  ) {
    return errorHandler(res, {
      name: 'ValidationError',
      message: `number of mines (${
        restProps.mines
      }) can not be higher than number cells (9)`
    });
  }

  const game = new Game({ ...restProps });
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

function openCell(req, res, game) {
  const newGame = game
    .openCell({
      x: Number(req.params.x),
      y: Number(req.params.y)
    })
    .toObject();
  Game.findByIdAndUpdate(
    game._id,
    { $set: { ...newGame } },
    { new: true },
    (err2, savedGame) => {
      if (err2) return errorHandler(res, err2);
      if (savedGame.state === 'lost') return res.status(200).json(savedGame);
      return res.status(200).json(cleanCells(savedGame));
    }
  );
}

function flagCell({ req, res, game, state }) {
  const newGame = game
    .flagCell({
      x: Number(req.params.x),
      y: Number(req.params.y),
      state
    })
    .toObject();
  Game.findByIdAndUpdate(
    game._id,
    { $set: { ...newGame } },
    { new: true },
    (err2, savedGame) => {
      if (err2) return errorHandler(res, err2);
      if (savedGame.state === 'lost') return res.status(200).json(savedGame);
      return res.status(200).json(cleanCells(savedGame));
    }
  );
}

module.exports = server;
