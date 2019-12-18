const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String } = Schema.Types;

const universityModel = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    discriminator: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('university', universityModel);
