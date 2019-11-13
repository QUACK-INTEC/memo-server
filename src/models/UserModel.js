const mongoose = require('mongoose');

const { Schema } = mongoose;

const {
    Number, String, Date, ObjectId,
} = Schema.Types;

const UserModel = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatarURL: {
        type: String,
    },
    points: {
        type: Number,
        default: 0,
    },
    lastSync: {
        type: Date,
    },
    sections: [{
        type: ObjectId,
        required: false,
        ref: 'section',
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('user', UserModel);
