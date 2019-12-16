const { Expo } = require('expo-server-sdk');
const winston = require('winston');

const { UserModel, SectionModel } = require('../models');

const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const expo = new Expo();

const registerToken = async (userId, expoPushToken) => {
    if (!Expo.isExpoPushToken(expoPushToken)) {
        throw new InvalidFieldError('El token no está en el formato correcto.');
    }

    await UserModel.findByIdAndUpdate(
        userId, { expoPushToken },
    ).lean().exec();
};

const sendNewPostNotification = async (newPost) => {
    const section = await SectionModel.findById(newPost.section).populate('students');

    const recipients = section.students.reduce((tokens, user) => {
        if (user._id.toString() !== newPost.author._id.toString()
            && Expo.isExpoPushToken(user.expoPushToken)) {
            tokens.push(user.expoPushToken);
        }
        return tokens;
    }, []);

    if (recipients.length === 0) {
        return;
    }

    try {
        await expo.sendPushNotificationsAsync([{
            to: recipients,
            sound: 'default',
            title: 'Nueva publicación creada',
            body: `${section.subject.name}: ${newPost.title}`,
            data: {
                postId: newPost._id,
            },
        }]);
    } catch (error) {
        winston.log('error', error);
    }
};

module.exports = {
    registerToken,
    sendNewPostNotification,
};
