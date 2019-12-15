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
        .populate('author')
        .lean()
        .exec();
    return posts;
};

const findSectionsForToday = async (dateString, currentUserId) => {
    const userId = new mongoose.Types.ObjectId(currentUserId);
    const date = extractDateFromYYYYMMDD(dateString);
    const day = convertWeekNumberToLetter(date.getDay());

    const sections = await SectionModel
        .find({ active: true, students: userId })
        .find({
            [`schedule.${day}`]: { $exists: true, $ne: null },
        })
        .populate('subject', 'name code university')
        .lean()
        .exec();
    const result = sections.map((s) => {
        const { from } = s.schedule[day];
        const { to } = s.schedule[day];

        const startHours = (new Date(date)).setHours(from + 4, 0, 0, 0);
        const endHours = (new Date(date)).setHours(to + 4, 0, 0, 0);
        const schedule = {
            from: startHours,
            to: endHours,
        };

        return {
            ...s,
            schedule,
        };
    });
    return result;
};


module.exports = {
    findEventsByDate,
    findSectionsForToday,
};
