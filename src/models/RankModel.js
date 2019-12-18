const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String } = Schema.Types;

const RankModel = new Schema({
    level: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    badgeUrl: {
        type: String,
        required: true,
    },
    maxPoints: {
        type: Number,
        unique: true,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('rank', RankModel);
