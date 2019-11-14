const mongoose = require('mongoose');

const SectionModel = require('./SectionModel.js');

const { Schema } = mongoose;

const { String, ObjectId } = Schema.Types;

const subjectModel = new Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    university: {
        type: ObjectId,
        ref: 'university',
        required: true,
    },
    sections: {
        type: [SectionModel.schema],
        required: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('subject', subjectModel);
