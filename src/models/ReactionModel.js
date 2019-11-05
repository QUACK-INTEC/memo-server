const mongoose = require('mongoose');
const { Schema } = mongoose;

const { Date } = Schema.Types;

const ReactionModel = new Schema({
  influence: {
    type: Number,
    required: true,
  },
}, { timestamps: true })

module.exports = mongoose.model('Reaction', ReactionModel);
