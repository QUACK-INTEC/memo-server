const { PostModel, SubjectModel, SectionModel } = require('../models');

const updateOrCreate = async (university, code, name) => SubjectModel.findOneAndUpdate(
    { university, code },
    { university, code, name },
    { new: true, upsert: true },
).lean().exec();

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
        .populate({
            path: 'attachments',
            model: 'attachment',
            populate: {
                path: 'uploadedBy',
                model: 'user',
            },
        })
        .lean({ autopopulate: true })
        .exec();
    posts.forEach((p) => {
        teachersMap[p.section.professorName] = [
            ...teachersMap[p.section.professorName],
            ...p.attachments,
        ];
    });

    const result = Object.keys(teachersMap).map((teacher) => ({ teacherName: teacher, resources: teachersMap[teacher] }));
    return result;
};

module.exports = {
    updateOrCreate,
    getPermanentResources,
};
