const { PostModel } = require('../models');
const NotFoundError = require('../constants/errors/NotFoundError');

const findById = async (id) => {
    const result = await PostModel
        .findById(id)
        .populate('author')
        .populate('attachments')
        .lean()
        .exec();
    if (!result) {
        throw new NotFoundError('Post no encontrado');
    }
    return result;
};
const create = async (data) => {
    const result = await new PostModel(data).save();
    return result;
};

const update = async (postData) => {
    const { id } = postData;
    return PostModel.findOneAndUpdate(
        { _id: id },
        postData,
        { new: true },
    ).lean().exec();
};

const deletePost = async (id) => PostModel.deleteOne({ _id: id }).lean().exec();

module.exports = {
    create,
    findById,
    update,
    deletePost,
};
