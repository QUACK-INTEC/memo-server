const mongoose = require('mongoose');
const { PostModel, SectionModel } = require('../models');
const { convertWeekNumberToLetter, extractDateFromYYYYMMDD } = require('../utils/dates');

const findEventsByDate = async (dateString, currentUserId, section, isPublic) => {
    const date = extractDateFromYYYYMMDD(dateString);
    const start = new Date(new Date(date).setHours(0, 0, 0, 0)).toUTCString();
    const end = new Date(new Date(date).setHours(23, 59, 59, 999)).toUTCString();


    let or = [
        { isPublic: true },
        { isPublic: false, author: currentUserId },
    ];
    if (isPublic !== null && isPublic !== undefined) {
        if (isPublic) {
            or = [{ isPublic: true }];
        } else {
            or = [{ isPublic: false, author: currentUserId }];
        }
    }
    console.log(or);

    const posts = await PostModel
        .find({
            section,
            endDate: { $gte: start, $lte: end },
            type: 'Event',
            $or: or,
        })
        .lean()
        .exec();
    return posts;
};

const findSectionsForToday = async (dateString, currentUserId) => {
    const userId = new mongoose.Types.ObjectId(currentUserId);
    const date = extractDateFromYYYYMMDD(dateString);
    const day = convertWeekNumberToLetter(date.getDay());

    const result = await SectionModel
        .find({ students: userId })
        .find({
            [`schedule.${day}`]: { $exists: true, $ne: null },
        })
        .populate('subject', 'name code university')
        .lean()
        .exec();

    return result;
};


module.exports = {
    findEventsByDate,
    findSectionsForToday,
};
