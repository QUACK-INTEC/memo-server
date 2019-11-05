const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String } = Schema.Types;

const AttachmentModel = new Schema({
    name: {
        type: String,
        required: true,
    },
    fileURL: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Attachment', AttachmentModel);
