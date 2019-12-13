const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { UserModel } = require('../models');

const memoEmail = 'memostudentapp@gmail.com';
const memoPassword = 'Fr4nc1n3';

const NotFoundError = require('../constants/errors/NotFoundError');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const create = async (userInfo) => {
    try {
        return await new UserModel(userInfo).save();
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            throw new InvalidFieldError('El usuario ya existe!');
        } else {
            throw err;
        }
    }
};

const findById = async (userId) => {
    const user = await UserModel.findById(userId).lean().exec();
    if (user) {
        return user;
    }
    throw new NotFoundError('Usuario no encontrado');
};

const findOne = async (userInfo) => UserModel.findOne().findOne(userInfo).lean().exec();

const updateAvatar = async (userId, imageUrl) => UserModel.findByIdAndUpdate(
    userId, { avatarURL: imageUrl }, { new: true },
).lean().exec();

const sendForgotPasswordEmail = async (email) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: memoEmail,
            pass: memoPassword,
        },
    });

    const tempCode = Math.random().toString(36).substring(6);

    const salt = await bcrypt.genSalt(10);
    const tempPass = await bcrypt.hash(tempCode, salt);

    const otpExpiration = (new Date()).setDate((new Date()).getDate() + 1);

    const res = await UserModel.updateOne({ email }, { otp: tempPass, otpExpiration });
    const mailOptions = {
        from: memoEmail,
        to: email,
        subject: 'Memo: Recover your password',
        text: `Your 24 hours valid and one time password is: ${tempCode}`,
    };


    let success = true;
    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            success = false;
        }
    });
    return success;
};

const changePassword = async (userData) => UserModel.findOneAndUpdate(
    { email: userData.email }, { password: userData.password },
).lean().exec();

module.exports = {
    create,
    findById,
    findOne,
    updateAvatar,
    sendForgotPasswordEmail,
    changePassword,
};
