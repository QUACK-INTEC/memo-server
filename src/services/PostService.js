const { PostModel, SubTaskModel } = require('../models');
const NotFoundError = require('../constants/errors/NotFoundError');

const findById = async (id, userId) => {
    const result = await PostModel
        .findById(id)
        .populate({ path: 'comments.author', model: 'user' })
        .populate({ path: 'comments.reactions.author', model: 'user' })
        .populate({ path: 'reactions.author', model: 'user' })
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
    result.currentUserReaction = result.reactions.find((r) => String(r.author && r.author._id) === String(userId));

    result.comments = result.comments.map((comment) => ({
        ...comment,
        currentUserReaction:
            comment.reactions.find((r) => String(r.author._id) === String(userId)),
    }));
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
};
