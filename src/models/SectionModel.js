const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String } = Schema.Types;

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
}, { timestamps: true });

module.exports = mongoose.model('section', SectionModel);
