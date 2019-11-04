const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date, String } = Schema.Types;

const AttachmentModel = new Schema({
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  Name: {
    type: String,
    required: true,
  },
  FileURL: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Attachment', AttachmentModel);
