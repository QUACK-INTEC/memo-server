const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String } = Schema.Types;

const subjectModel = new Schema({
  Name: {
    type: String,
    required: true,
    unique: true,
  },
  Code: {
    type: String,
    required: true,
    unique: true,
  },
  CreatedDate: {
    type: Date,
    default: Date.now,
  }
})

module.exports = mongoose.model('subject', subjectModel);
