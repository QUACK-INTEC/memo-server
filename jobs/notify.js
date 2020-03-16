const mongoose = require('mongoose');

require('../src/database');

const winston = require('winston');
const { Expo } = require('expo-server-sdk');

const { PostModel, SectionModel } = require('../src/models');

const expo = new Expo();

const getRecipients = async (sectionId, authorId, isPublic) => {
    const section = await SectionModel.findById(sectionId).populate('students').populate('subject');

    const recipients = section.students.reduce((tokens, user) => {
        if ((isPublic || user._id.toString() !== authorId)
            && Expo.isExpoPushToken(user.expoPushToken)) {
            tokens.push(user.expoPushToken);
        }
        return tokens;
    }, []);

    return recipients;
};

(async () => {
    // Fetch events for tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const start = new Date(new Date(tomorrow).setHours(0, 0, 0, 0));
    const end = new Date(new Date(tomorrow).setHours(23, 59, 59, 999));

    const events = await PostModel.find({
        type: 'Event',
        endDate: { $gte: start, $lte: end },
    }).populate({
        path: 'section',
        populate: { path: 'subject' },
    }).lean().exec();

    // build notifications
    const notifPromises = [];
    events.forEach((event) => {
        notifPromises.push((async () => {
            const participantTokens = await getRecipients(event.section._id,
                event.author.toString(), event.isPublic);

            const title = 'Se aproxima un evento';
            const body = `${event.section.subject.name}: ${event.title}`;

            return {
                _displayInForeground: true,
                to: participantTokens,
                sound: 'default',
                title,
                body,
                data: {
                    title,
                    body,
                    postId: event._id,
                },
            };
        })());
    });

    const messages = await Promise.all(notifPromises);

    // batch notifications
    const chunks = expo.chunkPushNotifications(messages);

    // send notifications
    const pushPromises = [];
    chunks.forEach((chunk) => {
        pushPromises.push((async () => {
            try {
                await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
                winston.error(error);
            }
        })());
    });

    await Promise.all(pushPromises);

    await mongoose.connection.close();
})();
