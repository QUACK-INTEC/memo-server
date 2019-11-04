const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String } = Schema.Types;

const PostModel = new Schema({
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  Title: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  StartDate: {
    type: Date,
  },
  EndDate: {
    type: Date,
  },
  Type: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Post', PostModel);
