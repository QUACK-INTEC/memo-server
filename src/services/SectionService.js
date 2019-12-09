const mongoose = require('mongoose');
const { SectionModel, PostModel } = require('../models');

const NotFoundError = require('../constants/errors/NotFoundError');

const findMySections = async (userId) => {
    const id = new mongoose.Types.ObjectId(userId);

    const result = await SectionModel
        .find({ students: id, active: true })
        .populate('students', 'firstName lastName email points')
        .populate('subject', 'name code university')
        .lean()
        .exec();
    return result;
};

const getCommonSections = async (firstUserId, secondUserId) => SectionModel.find({
    active: true,
    students: { $all: [firstUserId, secondUserId] },
});

const findById = async (id) => {
    const result = await SectionModel
        .findById(id)
        .populate('subject', 'name code university')
        .lean().exec();

    if (result == null) {
        throw new NotFoundError('Seccion no encontrada');
    }

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

    if (res == null) {
        throw new NotFoundError('Seccion no encontrada');
    }

    return res.students;
};

const findSectionsPosts = async (id, currentUserId) => {
    const section = await SectionModel.findById(id).lean().exec();

    if (section == null) {
        throw new NotFoundError('Seccion no encontrada');
    }

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
