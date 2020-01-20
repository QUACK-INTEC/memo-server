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
        autopopulate: true,
    },
    reactions: {
        type: [ReactionModel.schema],
        remove: false,
    },
    comments: {
        type: [CommentModel.schema],
        require: false,
    },
    attachments: [{
        type: ObjectId,
        required: false,
        ref: 'attachment',
    }],
    section: {
        type: ObjectId,
        required: true,
        ref: 'section',
        autopopulate: true,
    },
}, { timestamps: true });

PostModel.virtual('subtasks', {
    ref: 'subTask',
    localField: '_id',
    foreignField: 'post',
});
PostModel.plugin(require('mongoose-lean-virtuals'));

PostModel.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('post', PostModel);
