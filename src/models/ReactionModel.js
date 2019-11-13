const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const ReactionModel = new Schema({
    value: {
        type: Number,
        required: true,
    },
    author: {
        type: ObjectId,
        required: true,
        ref: 'user',
    },
}, { timestamps: true });

module.exports = mongoose.model('reaction', ReactionModel);
