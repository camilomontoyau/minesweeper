const mongoose = require('mongoose');

const { Schema } = mongoose;

const gameSchema = new Schema(
  {
    width: {
      type: Number,
      default: 3
    },
    height: {
      type: Number,
      default: 3
    },
    mines: {
      type: Number,
      default: 2,
      min: 2
    },
    board: Array,
    state: {
      type: String,
      enum: ['paused', 'started', 'won', 'lost'],
      default: 'started'
    },
    time: { type: Number, default: 0 },
    owner: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

function createBoard(game) {
  let board = [];
  for (let x = 0; x < game.width; x++) {
    board.push([]);
    for (let y = 0; y < game.height; y++) {
      board[x][y] = {
        mine: false,
        minesAround: 0,
        state: 'closed'
      };
    }
  }
  return board;
}

let minesCoordinates = [];
function insertMines(game) {
  let totalMines = game.mines;
  let xIndex = null;
  let yIndex = null;
  do {
    xIndex = randomNumber(game.width);
    yIndex = randomNumber(game.height);
    if (!game.board[xIndex][yIndex].mine) {
      game.board[xIndex][yIndex].mine = true;
      minesCoordinates.push({ xIndex, yIndex });
      totalMines--;
    }
  } while (totalMines > 0);
  return game.board;
}

function insertMinesAround(game) {
  minesCoordinates.forEach(singleCoordinate => {
    /* 
      --------------
      |a|    b   |c|
      -------------
      |d|  mine  |e|
      --------------
      |f|    g   |h|
      -------------- 
    */
    game = addMinesAround(singleCoordinate, game);
  });
  return game.board;
}

const addMinesAround = (singleCoordinate, game) => {
  const { xIndex, yIndex } = singleCoordinate;

  neighboursCoordinates(xIndex, yIndex).forEach(singleNeighbourCoordinate => {
    const { x, y } = singleNeighbourCoordinate;
    if (doesCellExist(x, y, game) && !game.board[x][y].mine) {
      game.board[x][y].minesAround++;
    }
  });
  return game;
};

const doesCellExist = (x, y, game) =>
  x >= 0 &&
  y >= 0 &&
  x < game.width &&
  y < game.height &&
  !!game.board[x] &&
  !!game.board[x][y];

const neighboursCoordinates = (xIndex, yIndex) => [
  { x: xIndex - 1, y: yIndex - 1 },
  { x: xIndex - 1, y: yIndex },
  { x: xIndex - 1, y: yIndex + 1 },
  { x: xIndex, y: yIndex - 1 },
  { x: xIndex, y: yIndex + 1 },
  { x: xIndex + 1, y: yIndex - 1 },
  { x: xIndex + 1, y: yIndex },
  { x: xIndex + 1, y: yIndex + 1 }
];

const randomNumber = max => Math.floor(Math.random() * max);

gameSchema.pre('save', function preSaveCallback(next) {
  if (!!this.board && !this.board.length) {
    this.board = createBoard(this);
    this.board = insertMines(this);
    this.board = insertMinesAround(this);
  }
  next();
});

gameSchema.methods.openCell = function({ x, y }) {
  if (doesCellExist(x, y, this) && this.board[x][y].state === 'closed') {
    this.board[x][y].state = 'opened';
    if (!!this.board[x][y].mine) {
      this.state = 'lost';
      return this;
    }
    if (!!this.board[x][y].minesAround) {
      return this;
    }
    propagateCellOpening({ x, y }, this);
    if (hasWon(this)) {
      this.state = 'won';
    }
  }
  return this;
};

gameSchema.methods.flagCell = function({ x, y, state }) {
  if (doesCellExist(x, y, this) && this.board[x][y].state === 'closed') {
    this.board[x][y].state = state;
  }
  return this;
};

function propagateCellOpening(origin, game) {
  const { x: xOrigin, y: yOrigin } = origin;
  const neighbours = neighboursCoordinates(xOrigin, yOrigin);
  for (let singleCoordinate of neighbours) {
    const { x, y } = singleCoordinate;
    if (!doesCellExist(x, y, game)) continue;
    if (!!game.board[x][y].mine) continue;
    if (game.board[x][y].state === 'closed') {
      game.board[x][y].state = 'opened';
      if (game.board[x][y].minesAround === 0) {
        propagateCellOpening(x, y);
      }
    }
  }
  return game;
}

module.exports = mongoose.model('Game', gameSchema);
