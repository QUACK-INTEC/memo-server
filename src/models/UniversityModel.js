const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String } = Schema.Types;

const universityModel = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('university', universityModel);
