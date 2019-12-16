const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { UserModel } = require('../models');

const { EMAIL_ADDRESS, EMAIL_PASSWORD } = require('../config/config');

const NotFoundError = require('../constants/errors/NotFoundError');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');
const ServerError = require('../constants/errors/ServerError');

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

const resetOtp = async (email) => {
    await UserModel.updateOne({ email }, { otp: '' });
};

const sendForgotPasswordEmail = async (email) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_ADDRESS,
            pass: EMAIL_PASSWORD,
        },
    });

    const tempCode = Math.random().toString(36).substring(6);

    const salt = await bcrypt.genSalt(10);
    const tempPass = await bcrypt.hash(tempCode, salt);

    const otpExpiration = (new Date()).setDate((new Date()).getDate() + 1);

    await UserModel.updateOne({ email }, { otp: tempPass, otpExpiration });
    const mailOptions = {
        from: EMAIL_ADDRESS,
        to: email,
        subject: 'Memo: Recuperar contraseña',
        text: `Su contraseña de uso único y 24 hours de validez es: ${tempCode}`,
    };


    const result = await transporter.sendMail(mailOptions);
    const success = result.accepted && result.accepted.length > 0;
    if (!success) {
        throw new ServerError('No se puedo enviar el email.');
    }
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
    resetOtp,
};
