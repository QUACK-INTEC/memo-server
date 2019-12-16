const { UserModel, RankModel } = require('../models');

const NotFoundError = require('../constants/errors/NotFoundError');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const create = async (userInfo) => {
    const data = userInfo;

    const defaultRank = await RankModel.findOne({}).sort({ level: 1 }).lean().exec();
    if (defaultRank) {
        data.rank = defaultRank._id;
    }
    try {
        return await new UserModel(data).save();
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            throw new InvalidFieldError('El usuario ya existe!');
        } else {
            throw err;
        }
    }
};

const findById = async (userId) => {
    const user = await UserModel.findById(userId).lean({ autopopulate: true }).exec();
    if (user) {
        return user;
    }
    throw new NotFoundError('Usuario no encontrado');
};

const findOne = async (userInfo) => UserModel.findOne(userInfo).lean({ autopopulate: true }).exec();

const updateAvatar = async (userId, imageUrl) => UserModel.findByIdAndUpdate(
    userId, { avatarURL: imageUrl }, { new: true },
).lean().exec();

const awardPoints = async (userId, amount) => {
    const { points, rank } = await UserModel.findByIdAndUpdate(
        userId, {
            $inc: {
                points: amount,
            },
        }, { new: true },
    ).populate('rank').lean().exec();

    // check if rank needs updating
    if (!rank || rank.maxPoints < points) {
        const nextRank = await RankModel.findOne({
            maxPoints: { $gte: points },
        }).sort({ maxPoints: 1 }).lean().exec();

        if (nextRank) {
            await UserModel.findByIdAndUpdate(userId, { rank: nextRank }).lean().exec();
        }
    }
};

module.exports = {
    create,
    findById,
    findOne,
    updateAvatar,
    awardPoints,
};
