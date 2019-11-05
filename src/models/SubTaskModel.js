const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String, Boolean } = Schema.Types;

const SubTaskModel = new Schema({
    name: {
        type: String,
        required: true,
    },
    isDone: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('subTask', SubTaskModel);
