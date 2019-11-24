const { SubjectModel } = require('../models');

const findOrCreate = async (university, code, name) => {
    const subject = await SubjectModel.findOne({ university, code }).lean().exec();
    if (subject) {
        return subject;
    }

    return new SubjectModel({ university, code, name }).save();
};

module.exports = {
    findOrCreate,
};
