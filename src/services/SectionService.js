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

module.exports = {
    findMySections,
    findById,
    findSectionsStudents,
    findSectionsPosts,
};
