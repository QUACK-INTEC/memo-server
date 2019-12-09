const mongoose = require('mongoose');
const ReactionModel = require('./ReactionModel');
const CommentModel = require('./CommentModel');

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
    isPublic: {
        type: Boolean,
        default: true,
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
        type: [ObjectId],
        required: false,
        ref: 'attachment',
    },
    section: {
        type: ObjectId,
        required: true,
        ref: 'section',
    },
}, { timestamps: true });

PostModel.virtual('subtasks', {
    ref: 'subTask',
    localField: '_id',
    foreignField: 'post',
});

module.exports = mongoose.model('post', PostModel);
