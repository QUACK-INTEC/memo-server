const mongoose = require('mongoose');
const { SectionModel } = require('../models');


const findMySections = async (userId) => {
    const id = new mongoose.Types.ObjectId(userId);

    const result = await SectionModel
        .find({ students: id })
        .populate('students', 'firstName lastName email points').lean().exec();
    return result;
};

const findById = async (id) => {
    const result = await SectionModel
        .findById(id).lean().exec();
    return result;
};

const updateOrCreate = async (sectionData) => {
    const { code, subject, discriminator } = sectionData;
    return SectionModel.findOneAndUpdate(
        { code, subject, discriminator },
        sectionData,
        { upsert: true },
    ).lean().exec();
};

const findSectionsStudents = async (id) => {
    const res = await SectionModel
        .findById(id).populate('students', 'firstName lastName email points').lean().exec();
    return res.students;
};

const findSectionsPosts = async (id) => {
    const res = await SectionModel
        .findById(id)
        .populate(
            'posts',
            'title description startDate endDate type author',
        ).lean().exec();
    return res.posts;
};

const joinSection = async (id, userId) => SectionModel.findByIdAndUpdate(id, {
    $addToSet: { students: userId },
});

module.exports = {
    findMySections,
    findById,
    findSectionsStudents,
    findSectionsPosts,
    updateOrCreate,
    joinSection,
};
