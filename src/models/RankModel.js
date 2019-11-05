const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String } = Schema.Types;

const RankModel = new Schema({
    level: {
        type: Number,
        required: true,
    },
    badgeUrl: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Rank', RankModel);
