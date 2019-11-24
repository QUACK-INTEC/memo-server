const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String, ObjectId } = Schema.Types;

const AttachmentModel = new Schema({
    name: {
        type: String,
    },
    fileURL: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: ObjectId,
        ref: 'user',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('attachment', AttachmentModel);
