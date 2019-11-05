const mongoose = require('mongoose');

const { Schema } = mongoose;

const ReactionModel = new Schema({
    influence: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('reaction', ReactionModel);
