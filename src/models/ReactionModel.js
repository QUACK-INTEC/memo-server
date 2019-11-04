const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date } = Schema.Types;

const ReactionModel = new Schema({
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  Influence: {
    type: Number,
    required: true,
  },
})

module.exports = mongoose.model('Reaction', ReactionModel);
