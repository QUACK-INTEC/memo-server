const { UserModel } = require('../models');

const NotFoundError = require('../constants/errors/NotFoundError');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const create = async (userInfo) => {
    try {
        return await new UserModel(userInfo).save();
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            throw new InvalidFieldError('El usuario ya existe!');
        } else {
            throw err;
        }
    }
};

const findById = async (userId) => {
    const user = await UserModel.findById(userId).lean().exec();
    if (user) {
        return user;
    }
    throw new NotFoundError('Usuario no encontrado');
};

const findOne = async (userInfo) => UserModel.findOne().findOne(userInfo).lean().exec();

const updateAvatar = async (userId, imageUrl) => UserModel.findByIdAndUpdate(
    userId, { avatarURL: imageUrl }, { new: true },
).lean().exec();

const awardPoints = async (userId, points) => {
    await UserModel.findByIdAndUpdate(
        userId, {
            $inc: {
                points,
            },
        },
    ).lean().exec();
};

module.exports = {
    create,
    findById,
    findOne,
    updateAvatar,
    awardPoints,
};
