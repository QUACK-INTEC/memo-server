const { PostModel, SubTaskModel } = require('../models');
const NotFoundError = require('../constants/errors/NotFoundError');

const findById = async (id, userId) => {
    const result = await PostModel
        .findById(id)
        .populate('author')
        .populate('attachments')
        .populate({
            path: 'subtasks',
            match: { author: userId },
        })
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

const resetVote = async (id, userId) => {
    const post = await PostModel
        .findById(id)
        .exec();
    if (!post) {
        throw new NotFoundError('Post no encontrado');
    }
    const result = PostModel.update(
        { _id: id },
        {
            $pull: {
                reactions: {
                    author: userId,
                },
            },
        },
    ).lean().exec();
    return result;
};


const changeVote = async (id, userId, value) => {
    await resetVote(id, userId);
    const result = PostModel.update(
        { _id: id },
        {
            $push: {
                reactions: {
                    author: userId,
                    value,
                },
            },
        },
    ).lean().exec();
    return result;
};

const upVote = async (id, userId) => changeVote(id, userId, 1);
const downVote = async (id, userId) => changeVote(id, userId, -1);

const deletePost = async (id) => PostModel.deleteOne({ _id: id }).lean().exec();

const addSubtask = async (data) => new SubTaskModel(data).save();

const updateSubtask = async (data) => {
    const doc = await SubTaskModel.findOneAndUpdate({
        _id: data._id,
        post: data.post,
        author: data.author,
    }, { isDone: data.isDone }, { new: true }).lean().exec();

    if (doc == null) {
        throw new NotFoundError('Tarea no encontrada para este usuario');
    }

    return doc;
};

const deleteSubtask = async (id, postId, userId) => {
    const deletedDoc = await SubTaskModel.findOneAndDelete({
        _id: id,
        post: postId,
        author: userId,
    }).lean().exec();

    if (deletedDoc) {
        return true;
    }

    throw new NotFoundError('Tarea no encontrada para este usuario');
};

module.exports = {
    create,
    findById,
    update,
    deletePost,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    upVote,
    downVote,
    resetVote,
};
