const mongoose = require('mongoose');
const cell = require('./cell');

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

module.exports = mongoose.model('Game', gameSchema);
