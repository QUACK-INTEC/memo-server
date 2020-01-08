const mongoose = require('mongoose');
const { PostModel, SubTaskModel } = require('../models');
const NotificationService = require('./NotificationService');
const NotFoundError = require('../constants/errors/NotFoundError');
const ForbiddenError = require('../constants/errors/ForbiddenError');

const findById = async (id, userId) => {
    const result = await PostModel
        .findById(id)
        .populate({ path: 'comments.reactions.author', model: 'user' })
        .populate({ path: 'reactions.author', model: 'user' })
        .populate('attachments')
        .populate({
            path: 'subtasks',
            match: { author: userId },
        })
        .lean({ virtuals: true, autopopulate: true })
        .exec();
    if (!result) {
        throw new NotFoundError('Post no encontrado');
    }
    result.currentUserReaction = result.reactions.find(
        (r) => String(r.author && r.author._id) === String(userId),
    );

    const comments = result.comments.map((comment) => {
        const newComment = {
            ...comment,
            currentUserReaction:
            comment.reactions.find((r) => String(r.author._id) === String(userId)),
        };
        return newComment;
    });
    return {
        ...result,
        comments,
    };
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

const resetVoteComment = async (id, userId) => {
    const post = await PostModel.findOne(
        {
            'comments._id': id,
        },
    )
        .exec();
    const comment = post.comments.id(id);
    const reactions = [];
    comment.reactions.forEach((r) => {
        if (String(r.author) !== String(userId)) {
            reactions.push(r);
        }
    });

    const result = await PostModel.update({ _id: post._id, 'comments._id': id }, {
        $set:
        { 'comments.$.reactions': reactions },
    }, { upsert: true });
    return result;
};

const changeVoteComment = async (id, userId, value) => {
    await resetVoteComment(id, userId);
    const reaction = {
        author: userId,
        value,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    const result = await PostModel.update({ 'comments._id': id }, {
        $push:
        { 'comments.$.reactions': reaction },
    });
    return result;
};

const upVoteComment = async (id, userId) => changeVoteComment(id, userId, 1);
const downVoteComment = async (id, userId) => changeVoteComment(id, userId, -1);

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

    if (post.isPublic && post.author._id.toString() !== userId.toString()) {
        await NotificationService.sendNewCommentNotification(post, comment);
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

    if (comment.author._id.toString() !== authorId.toString()) {
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
    upVoteComment,
    downVoteComment,
    resetVoteComment,
    addComment,
    deleteComment,
};
