const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String } = Schema.Types;

const RankModel = new Schema({
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  Level: {
    type: Number,
    required: true,
  },
  BadgeUrl: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Rank', RankModel);
