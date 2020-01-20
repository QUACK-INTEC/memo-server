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
    otp: {
        type: String,
        required: false,
    },
    otpExpiration: {
        type: Date,
        required: false,
    },
    avatarURL: {
        type: String,
    },
    points: {
        type: Number,
        default: 0,
    },
    rank: {
        type: ObjectId,
        ref: 'rank',
        autopopulate: true,
    },
    syncStatus: [{
        university: {
            type: ObjectId,
            ref: 'university',
            required: true,
        },
        syncDate: Date,
        discriminator: String,
    }],
    expoPushToken: String,
}, {
    timestamps: true,
});

UserModel.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('user', UserModel);
