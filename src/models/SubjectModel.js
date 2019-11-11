const mongoose = require('mongoose');

const SectionModel = require('./SectionModel.js');

const { Schema } = mongoose;

const { String } = Schema.Types;

const subjectModel = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    sections: {
        type: [SectionModel.schema],
        required: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('subject', subjectModel);
