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
      required: [true, 'Mines is required.']
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

function insertMines(board) {
  throw new Error('missing insertMines');
}

function insertMinesAround(board) {
  throw new Error('missing insertMinesAround');
}

gameSchema.pre('save', function(next) {
  if (!this.board) {
    this.board = createBoard(this);
  }
  next();
});

module.exports = mongoose.model('Game', gameSchema);
