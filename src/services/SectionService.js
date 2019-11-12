const mongoose = require('mongoose');
const { SectionModel } = require('../models');


const findMySections = async (userId) => {
    const id = new mongoose.Types.ObjectId(userId);

    const a = await SectionModel
        .find({ students: mongoose.Schema.ObjectId(id) }).lean().exec();
    console.log(a);
    return a;
};

module.exports = {
    findMySections,
};
