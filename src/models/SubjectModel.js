const mongoose = require('mongoose');

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
}, { timestamps: true });

module.exports = mongoose.model('subject', subjectModel);
