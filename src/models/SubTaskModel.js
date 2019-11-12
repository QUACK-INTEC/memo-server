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
    },
    author: {
        type: ObjectId,
        required: true,
        ref: 'user',
    },
}, { timestamps: true });

module.exports = mongoose.model('subTask', SubTaskModel);
