const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String } = Schema.Types;

const CommentModel = new Schema({
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  Body: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Comment', CommentModel);
