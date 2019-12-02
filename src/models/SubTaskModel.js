const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String, Boolean, ObjectId } = Schema.Types;

const SubTaskModel = new Schema({
    name: {
        type: String,
        required: true,
    },
    isDone: {
        type: Boolean,
        required: true,
        default: false,
    },
    author: {
        type: ObjectId,
        required: true,
        ref: 'user',
    },
    post: {
        type: ObjectId,
        required: true,
        ref: 'post',
    },
}, { timestamps: true });

module.exports = mongoose.model('subTask', SubTaskModel);
