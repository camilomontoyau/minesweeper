const mongoose = require('mongoose');

const { Schema } = mongoose;

const cellSchema = new Schema({
  mine: { type: Boolean, default: false },
  minesAround: { type: Number, default: 0 },
  state: {
    type: String,
    enum: ['opened', 'closed', 'flagged', 'question'],
    default: 'closed'
  }
});

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
    board: [[cellSchema]],
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
