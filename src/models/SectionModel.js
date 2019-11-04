const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String } = Schema.Types;

const SectionModel = new Schema({
  ProfessorName: {
    type: String,
  },
  Schedule: {
    type: String,
    required: true,
  },
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  ClassRoom: {
    type: String,
  },
  Code: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Section', SectionModel);
