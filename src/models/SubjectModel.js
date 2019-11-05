const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String } = Schema.Types;

const subjectModel = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  Code: {
    type: String,
    required: true,
    unique: true,
  }
}, { timestamps: true })

module.exports = mongoose.model('subject', subjectModel);
