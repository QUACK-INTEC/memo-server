const mongoose = require('mongoose');
const { SectionModel, PostModel } = require('../models');

const findMySections = async (userId) => {
    const id = new mongoose.Types.ObjectId(userId);

    const result = await SectionModel
        .find({ students: id })
        .populate('students', 'firstName lastName email points')
        .populate('subject', 'name code university')
        .lean()
        .exec();
    return result;
};

const getCommonSections = async (firstUserId, secondUserId) => SectionModel.find({
    students: { $all: [firstUserId, secondUserId] },
});

const findById = async (id) => {
    const result = await SectionModel
        .findById(id)
        .populate('subject', 'name code university')
        .lean().exec();
    return result;
};

const updateOrCreate = async (sectionData) => {
    const { code, subject, discriminator } = sectionData;
    return SectionModel.findOneAndUpdate(
        { code, subject, discriminator },
        sectionData,
        { new: true, upsert: true },
    ).lean().exec();
};

const findSectionsStudents = async (id) => {
    const res = await SectionModel
        .findById(id)
        .populate('students', 'firstName lastName email points')
        .populate('subject', 'name code university')
        .lean()
        .exec();
    return res.students;
};

const findSectionsPosts = async (id, currentUserId) => {
    const posts = await PostModel
        .find({
            section: id,
            $or: [
                { isPublic: true },
                { isPublic: false, author: currentUserId },
            ],
        })
        .populate('author')
        .populate({ path: 'reactions.author', model: 'user' })
        .lean()
        .exec();
    return posts;
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
    getCommonSections,
};
