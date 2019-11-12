const mongoose = require('mongoose');
const ReactionModel = require('./ReactionModel');
const CommentModel = require('./CommentModel');
const AttachmentModel = require('./AttachmentModel');

const { Schema } = mongoose;


const { Date, String, ObjectId } = Schema.Types;

const PostModel = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    type: {
        type: String,
        enum: ['Event', 'Resource'],
        required: true,
    },
    author: {
        type: ObjectId,
        required: true,
        ref: 'user',
    },
    reactions: {
        type: [ReactionModel.schema],
        remove: false,
    },
    comments: {
        type: [CommentModel.schema],
        require: false,
    },
    attachments: {
        type: [AttachmentModel.schema],
        require: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('post', PostModel);
