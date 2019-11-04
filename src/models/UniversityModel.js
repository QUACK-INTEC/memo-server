const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String } = Schema.Types;

const universityModel = new Schema({
  Name: {
    type: String,
    required: true,
    unique: true,
  },
  CreatedDate: {
    type: Date,
    default: Date.now,
  }
})

module.exports = mongoose.model('university', universityModel);
