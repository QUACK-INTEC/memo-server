const { UserModel } = require('../models');

const create = async (userInfo) => new UserModel(userInfo).save();

const findById = async (userId) => {
    const user = await UserModel.findById(userId).lean().exec();
    if (user) {
        return user;
    }
    throw new Error('User not found'); // FIXME This needs to be standardized in some way
};

const findOne = async (userInfo) => UserModel.findOne().findOne(userInfo).lean().exec();

module.exports = {
    create,
    findById,
    findOne,
};
