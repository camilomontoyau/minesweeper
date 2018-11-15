const mongoose = require('mongoose');
const Cell = require('./cell');

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
      board[x][y] = new Cell();
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
  const neighboursCoordinates = [
    { x: xIndex - 1, y: yIndex - 1 },
    { x: xIndex - 1, y: yIndex },
    { x: xIndex - 1, y: yIndex + 1 },
    { x: xIndex, y: yIndex - 1 },
    { x: xIndex, y: yIndex + 1 },
    { x: xIndex + 1, y: yIndex - 1 },
    { x: xIndex + 1, y: yIndex },
    { x: xIndex + 1, y: yIndex + 1 }
  ];

  neighboursCoordinates.forEach(singleNeighbourCoordinate => {
    const xx = singleNeighbourCoordinate.x;
    const yy = singleNeighbourCoordinate.y;
    if (
      xx >= 0 &&
      yy >= 0 &&
      xx < game.width &&
      yy < game.height &&
      !game.board[xx][yy].mine
    ) {
      game.board[xx][yy].minesAround++;
    }
  });
  return game;
};

const randomNumber = max => Math.floor(Math.random() * max);

gameSchema.pre('save', function(next) {
  if (!!this.board && !this.board.length) {
    this.board = createBoard(this);
    this.board = insertMines(this);
    this.board = insertMinesAround(this);
  }
  next();
});

module.exports = mongoose.model('Game', gameSchema);
