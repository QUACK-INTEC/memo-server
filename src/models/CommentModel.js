const mongoose = require('mongoose');
const ReactionModel = require('./ReactionModel');

const { Schema } = mongoose;

const { String, ObjectId } = Schema.Types;

const CommentModel = new Schema({
    body: {
        type: String,
        required: true,
    },
    author: {
        type: ObjectId,
        required: true,
        ref: 'user',
    },
    reactions: {
        type: [ReactionModel.schema],
        required: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('comment', CommentModel);
