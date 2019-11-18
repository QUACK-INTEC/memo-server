const { UserModel } = require('../models');

const NotFoundError = require('../constants/errors/NotFoundError');

const create = async (userInfo) => new UserModel(userInfo).save();

const findById = async (userId) => {
    const user = await UserModel.findById(userId).lean().exec();
    if (user) {
        return user;
    }
    throw new NotFoundError('Usuario no encontrado');
};

const findOne = async (userInfo) => UserModel.findOne().findOne(userInfo).lean().exec();

module.exports = {
    create,
    findById,
    findOne,
};
