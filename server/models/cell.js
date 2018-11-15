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

module.exports = mongoose.model('Cell', cellSchema);
