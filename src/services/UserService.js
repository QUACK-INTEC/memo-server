const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { UserModel, RankModel, UniversityModel } = require('../models');

const { EMAIL_ADDRESS, EMAIL_PASSWORD } = require('../config/config');
const { otpEmailTemplate, welcomeEmailTemplate } = require('../utils/emailTemplates');

const NotFoundError = require('../constants/errors/NotFoundError');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const create = async (userInfo) => {
    const data = userInfo;

    const defaultRank = await RankModel.findOne({}).sort({ level: 1 }).lean().exec();
    if (defaultRank) {
        data.rank = defaultRank._id;
    }
    try {
        const newUser = await new UserModel(data).save();

        if (EMAIL_ADDRESS && EMAIL_PASSWORD) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: EMAIL_ADDRESS,
                    pass: EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: EMAIL_ADDRESS,
                to: data.email,
                subject: 'Bienvenido a Memo',
                html: welcomeEmailTemplate(),
            };

            transporter.sendMail(mailOptions);
        }

        return newUser;
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            throw new InvalidFieldError('El usuario ya existe!');
        } else {
            throw err;
        }
    }
};

const findById = async (userId) => {
    const user = await UserModel.findById(userId).lean({ autopopulate: true }).exec();
    if (user) {
        return user;
    }
    throw new NotFoundError('Usuario no encontrado');
};

const findOne = async (userInfo) => UserModel.findOne(userInfo).lean({ autopopulate: true }).exec();

const updateAvatar = async (userId, imageUrl) => UserModel.findByIdAndUpdate(
    userId, { avatarURL: imageUrl }, { new: true },
).lean().exec();

const resetOtp = async (email) => {
    await UserModel.updateOne({ email }, { otp: '' });
};

const sendForgotPasswordEmail = async (email) => {
    if (EMAIL_ADDRESS && EMAIL_PASSWORD) {
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
            text: `Su contraseña de uso único y 24 horas de validez es: ${tempCode}`,
            html: otpEmailTemplate(tempCode),
        };

        const result = await transporter.sendMail(mailOptions);
        const success = result.accepted && result.accepted.length > 0;
        return success;
    }

    return false;
};

const changePassword = async (userData) => UserModel.findOneAndUpdate(
    { email: userData.email }, { password: userData.password },
).lean().exec();

const awardPoints = async (userId, amount) => {
    const { points, rank } = await UserModel.findByIdAndUpdate(
        userId, {
            $inc: {
                points: amount,
            },
        }, { new: true },
    ).populate('rank').lean().exec();

    // check if rank needs updating
    if (!rank || rank.maxPoints < points) {
        const nextRank = await RankModel.findOne({
            maxPoints: { $gte: points },
        }).sort({ maxPoints: 1 }).lean().exec();

        if (nextRank) {
            await UserModel.findByIdAndUpdate(userId, { rank: nextRank }).lean().exec();
        }
    }
};

const updateSyncStatus = async (userId, universityId, discriminator, syncDate) => {
    const updateRes = await UserModel.updateOne(
        { _id: userId, 'syncStatus.university': universityId },
        { $set: { 'syncStatus.$.syncDate': syncDate, 'syncStatus.$.discriminator': discriminator } },
    );

    if (updateRes.nModified === 0) {
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { syncStatus: { syncDate, discriminator, university: universityId } },
        }).lean().exec();
    }
};

const checkSyncRequired = async (userId) => {
    const user = await UserModel.findById(userId).lean().exec();

    if (!user.syncStatus || user.syncStatus.length === 0) {
        return true;
    }

    const requiredPromises = [];
    user.syncStatus.forEach((status) => {
        requiredPromises.push((async () => {
            const university = await UniversityModel.findById(status.university).lean().exec();
            return university.discriminator !== status.discriminator;
        })());
    });

    const requiredResult = await Promise.all(requiredPromises);
    return requiredResult.some((r) => r);
};

module.exports = {
    create,
    findById,
    findOne,
    updateAvatar,
    sendForgotPasswordEmail,
    changePassword,
    resetOtp,
    awardPoints,
    updateSyncStatus,
    checkSyncRequired,
};
