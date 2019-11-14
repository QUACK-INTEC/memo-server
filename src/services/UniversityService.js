const { UniversityModel } = require('../models');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const findByName = async (universityName) => {
    const university = await UniversityModel.findOne({ name: universityName }).lean().exec();
    if (university) {
        return university;
    }
    throw new InvalidFieldError('La universidad no existe');
};

module.exports = {
    findByName,
};
