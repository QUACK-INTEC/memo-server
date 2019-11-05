const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String , ObjectId } = Schema.Types;

const CommentModel = new Schema({
  body: {
    type: String,
    required: true,
  },
  author: {
    type: ObjectId,
    required: true,
  }
}, { timestamps: true })

module.exports = mongoose.model('Comment', CommentModel);
