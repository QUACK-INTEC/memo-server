const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String, Boolean } = Schema.Types;

const SubTaskModel = new Schema({
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  Name: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    required: true,
  },
})

module.exports = mongoose.model('SubTask', SubTaskModel);
