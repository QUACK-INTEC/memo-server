const mongoose = require('mongoose');
const { PostModel, SectionModel } = require('../models');
const { convertWeekNumberToLetter, extractDateFromYYYYMMDD } = require('../utils/dates');

const findEventsByDate = async (dateString, currentUserId, section, isPublic) => {
    const date = extractDateFromYYYYMMDD(dateString);
    const start = new Date(new Date(date).setHours(0, 0, 0, 0));
    const end = new Date(new Date(date).setHours(23, 59, 59, 999));

    let or = [
        { isPublic: true },
        { isPublic: false, author: currentUserId },
    ];
    if (String(isPublic) === 'true') {
        or = [{ isPublic: true }];
    } else if (String(isPublic) === 'false') {
        or = [{ isPublic: false, author: currentUserId }];
    }

    const query = {
        type: 'Event',
        endDate: { $gte: start, $lte: end },
        $or: or,
    };
    if (section) query.section = section;
    const posts = await PostModel
        .find(query)
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
