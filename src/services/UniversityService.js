const { UniversityModel } = require('../models');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const findByName = async (universityName) => {
    const university = await UniversityModel.findOne({ name: universityName }).lean().exec();
    if (university) {
        return university;
    }
    throw new InvalidFieldError('La universidad no existe');
};

const getAll = async () => UniversityModel.find().lean().exec();

const updateDiscriminator = async (universityId, discriminator) => UniversityModel
    .findByIdAndUpdate(universityId, { discriminator }).lean().exec();

const getLastDiscriminator = async (universityId) => {
    const { discriminator } = await UniversityModel.findById(universityId).lean().exec();
    return discriminator;
};

module.exports = {
    findByName,
    getAll,
    updateDiscriminator,
    getLastDiscriminator,
};
