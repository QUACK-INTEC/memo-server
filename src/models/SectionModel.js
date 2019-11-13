const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String, Boolean, ObjectId } = Schema.Types;

const SectionModel = new Schema({
    professorName: {
        type: String,
    },
    schedule: {
        type: String,
        required: true,
    },
    classRoom: {
        type: String,
    },
    code: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    students: [{
        type: ObjectId,
        required: true,
        ref: 'user',
    }],
    posts: [{
        type: ObjectId,
        required: true,
        ref: 'post',
    }],
}, { timestamps: true });

module.exports = mongoose.model('section', SectionModel);
