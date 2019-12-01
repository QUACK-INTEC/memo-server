const { PostModel, SubjectModel, SectionModel } = require('../models');

const findOrCreate = async (university, code, name) => {
    const subject = await SubjectModel.findOne({ university, code }).lean().exec();
    if (subject) {
        return subject;
    }

    return new SubjectModel({ university, code, name }).save();
};

const getPermanentResources = async (subjectId) => {
    const sections = await SectionModel.find({ subject: subjectId, active: false }).lean().exec();

    const teachersMap = {};
    sections.forEach((s) => {
        if (!Object.keys(teachersMap).includes(s.professorName)) {
            teachersMap[s.professorName] = [];
        }
    });

    const sectionIds = sections.map((s) => s._id);
    const posts = await PostModel.find({
        section: { $in: sectionIds },
    })
        .populate('section')
        .populate('author')
        .populate('attachments')
        .lean()
        .exec();

    posts.forEach((p) => teachersMap[p.section.professorName].push(p));

    const result = Object.keys(teachersMap).map((teacher) => ({ teacherName: teacher, resources: teachersMap[teacher] }));
    return result;
};

module.exports = {
    findOrCreate,
    getPermanentResources,
};
