const mongoose = require('mongoose');

const { Schema } = mongoose;

const { Date, String } = Schema.Types;

const PostModel = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
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
}, { timestamps: true });

module.exports = mongoose.model('Post', PostModel);
