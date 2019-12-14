const mongoose = require('mongoose');
const { PostModel, SubTaskModel } = require('../models');
const NotificationService = require('./NotificationService');
const NotFoundError = require('../constants/errors/NotFoundError');
const ForbiddenError = require('../constants/errors/ForbiddenError');

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

    if (result.isPublic) {
        await NotificationService.sendNewPostNotification(result);
    }

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

const addComment = async (postId, userId, body) => {
    const comment = {
        _id: mongoose.Types.ObjectId(),
        author: userId,
        body,
    };

    const post = await PostModel.findByIdAndUpdate(postId, {
        $push: {
            comments: comment,
        },
    }).lean().exec();

    if (!post) {
        throw new NotFoundError('Publicacion no encontrada');
    }

    return comment;
};

const deleteComment = async (postId, authorId, commentId) => {
    const post = await PostModel.findById(postId).exec();

    if (!post) {
        throw new NotFoundError('Publicacion no encontrada');
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
        throw new NotFoundError('Comentario no encontrado');
    }

    if (comment.author.toString() !== authorId.toString()) {
        throw new ForbiddenError('Este comentario no le pertenece!');
    }

    const updateRes = await post.update({
        $pull: {
            comments: {
                _id: commentId,
            },
        },
    });

    return !!(updateRes.ok && updateRes.nModified);
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
    addComment,
    deleteComment,
};
