const mongoose = require('mongoose');
const Cell = require('./cell');

const { Schema } = mongoose;

const gameSchema = new Schema(
  {
    width: {
      type: Number,
      required: [true, 'Width is required.']
    },
    height: {
      type: Number,
      required: [true, 'Height is required.']
    },
    mines: {
      type: Number,
      required: [true, 'Mines is required.'],
      min: 1
    },
    board: [[cell]],
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

const buildBoard = game => {
  let board = [];

  for (let row = 0; row < game.width; row++) {
    for (let col = 0; col < game.height; col++) {}
  }

  return board;
};

function createBoard(game) {
  let board = [];
  for (let row = 0; row < game.width; row++) {
    board.push([]);
    for (let col = 0; col < game.height; col++) {
      board[row][col] = new Cell();
    }
  }
  return board;
}

function insertMines(game) {
  let totalMines = game.mines;
  let rowIndex = null;
  let colIndex = null;
  do {
    rowIndex = randomNumber(game.width);
    colIndex = randomNumber(game.height);
    if (!!game.board[rowIndex][colIndex].mine) {
      game.board[rowIndex][colIndex].mine = true;
      totalMines--;
    }
  } while (totalMines > 0);
  return game.board;
}

function insertMinesAround(game) {
  throw new Error('missing insertMinesAround');
}

const randomNumber = max => Math.floor(Math.random() * max);

gameSchema.pre('save', function(next) {
  if (!this.board) {
    this.board = createBoard(this);
    this.board = insertMines(this);
  }
  next();
});

module.exports = mongoose.model('Game', gameSchema);
