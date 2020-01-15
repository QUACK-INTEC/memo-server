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

const unregisterToken = async (userId) => {
    await UserModel.findByIdAndUpdate(
        userId, { expoPushToken: null },
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
        const title = 'Nueva publicación creada';
        const body = `${section.subject.name}: ${newPost.title}`;

        await expo.sendPushNotificationsAsync([{
//             _displayInForeground: true,
            to: recipients,
            sound: 'default',
            title,
            body,
            data: {
                title,
                body,
                postId: newPost._id,
            },
        }]);
    } catch (error) {
        winston.log('error', error);
    }
};

const sendNewCommentNotification = async (post, newComment) => {
    const { body, author } = newComment;
    const postAuthorUser = await UserModel.findById(post.author);
    const commentAuthorUser = await UserModel.findById(author);

    if (Expo.isExpoPushToken(postAuthorUser.expoPushToken)) {
        try {
            const { firstName, lastName } = commentAuthorUser;
            const title = `${firstName} ${lastName} comentó en tu publicación`;

            await expo.sendPushNotificationsAsync([{
//                 _displayInForeground: true,
                to: postAuthorUser.expoPushToken,
                sound: 'default',
                title,
                body,
                data: {
                    title,
                    body,
                    postId: post._id,
                    commentId: newComment._id,
                },
            }]);
        } catch (error) {
            winston.log('error', error);
        }
    }
};

module.exports = {
    registerToken,
    unregisterToken,
    sendNewPostNotification,
    sendNewCommentNotification,
};
