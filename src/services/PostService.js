const mongoose = require('mongoose');
const { PostModel, SubTaskModel } = require('../models');
const NotificationService = require('./NotificationService');
const UserService = require('./UserService');
const NotFoundError = require('../constants/errors/NotFoundError');
const ForbiddenError = require('../constants/errors/ForbiddenError');
const {
    POINTS_COMMENT_TO_COMMENT_CREATOR,
    POINTS_COMMENT_TO_POST_CREATOR,
    POINTS_COMMENT_REACTION_TO_COMMENT_CREATOR,
    POINTS_COMMENT_REACTION_TO_REACTION_CREATOR,
    POINTS_POST_REACTION_TO_POST_CREATOR,
    POINTS_POST_REACTION_TO_REACTION_CREATOR,
} = require('../constants/points');


const findById = async (id, userId) => {
    const result = await PostModel
        .findById(id)
        .populate({ path: 'comments.reactions.author', model: 'user' })
        .populate({ path: 'comments.author', model: 'user' })
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
        .populate({ path: 'reactions.author', model: 'user' })
        .exec();
    if (!post) {
        throw new NotFoundError('Post no encontrado');
    }

    let valueOfPreviousReaction = 0;
    const reactions = [];
    post.reactions.forEach((r) => {
        if (String(r.author._id) !== String(userId)) {
            reactions.push(r);
        } else {
            valueOfPreviousReaction = r.value; // This was my reaction
        }
    });


    // Reseting
    // My reaction before was positive, then remove 1 point from author
    if (valueOfPreviousReaction > 0) {
        await UserService.awardPoints(post.author.id,
            -1 * POINTS_POST_REACTION_TO_POST_CREATOR); // points author

        // Before I was give points, then, take then from me.
        await UserService.awardPoints(userId,
            -1 * POINTS_POST_REACTION_TO_REACTION_CREATOR); // points reactioner
    } else if (valueOfPreviousReaction < 0) {
        // My reaction before was negative, then add 1 point, because before we rested 1.
        await UserService.awardPoints(post.author.id,
            POINTS_POST_REACTION_TO_POST_CREATOR); // points author

        // Before I was give points, then, take then from me.
        await UserService.awardPoints(userId,
            -1 * POINTS_POST_REACTION_TO_REACTION_CREATOR); // points reactioner
    }

    const result = await PostModel.update(
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

    const post = await PostModel.findOne(
        {
            _id: id,
        },
    ).exec();

    if (value > 0) { // Reaction was positive
        await UserService.awardPoints(
            post.author.id,
            POINTS_POST_REACTION_TO_POST_CREATOR,
        );
        await UserService.awardPoints(userId, POINTS_POST_REACTION_TO_REACTION_CREATOR);
    } else if (value < 0) { // Reaction was negative
        await UserService.awardPoints(
            post.author.id,
            POINTS_POST_REACTION_TO_POST_CREATOR * -1,
        );
        await UserService.awardPoints(userId, POINTS_POST_REACTION_TO_REACTION_CREATOR);
    }
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

    let valueOfPreviousReaction = 0;

    const reactions = [];
    comment.reactions.forEach((r) => {
        if (String(r.author) !== String(userId)) {
            reactions.push(r);
        } else {
            valueOfPreviousReaction = r.value; // This was my reaction
        }
    });

    // Reseting
    // My reaction before was positive, then remove 1 point from author
    if (valueOfPreviousReaction > 0) {
        await UserService.awardPoints(comment.author.id,
            -1 * POINTS_COMMENT_REACTION_TO_COMMENT_CREATOR); // points author

        // Before I was give points, then, take then from me.
        await UserService.awardPoints(userId,
            -1 * POINTS_COMMENT_REACTION_TO_REACTION_CREATOR); // points reactioner
    } else if (valueOfPreviousReaction < 0) {
        // My reaction before was negative, then add 1 point, because before we rested 1.
        await UserService.awardPoints(comment.author.id,
            POINTS_COMMENT_REACTION_TO_COMMENT_CREATOR); // points author

        // Before I was give points, then, take then from me.
        await UserService.awardPoints(userId,
            -1 * POINTS_COMMENT_REACTION_TO_REACTION_CREATOR); // points reactioner
    }

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

    const post = await PostModel.findOne(
        {
            'comments._id': id,
        },
    )
        .exec();
    const comment = post.comments.id(id);

    if (value > 0) { // Reaction was positive
        await UserService.awardPoints(
            comment.author.id,
            POINTS_COMMENT_REACTION_TO_COMMENT_CREATOR,
        );
        await UserService.awardPoints(userId, POINTS_COMMENT_REACTION_TO_REACTION_CREATOR);
    } else if (value < 0) { // Reaction was negative
        await UserService.awardPoints(
            comment.author.id,
            POINTS_COMMENT_REACTION_TO_COMMENT_CREATOR * -1,
        );
        await UserService.awardPoints(userId, POINTS_COMMENT_REACTION_TO_REACTION_CREATOR);
    }
    return result;
};

const upVoteComment = async (id, userId) => changeVoteComment(id, userId, 1);
const downVoteComment = async (id, userId) => changeVoteComment(id, userId, -1);

const deletePost = async (id) => PostModel.deleteOne({ _id: id }).lean().exec();

const addSubtask = async (data) => {
    const post = await PostModel.findById(data.post).lean().exec();

    if (!post) {
        throw new NotFoundError('Publicacion no encontrada');
    }

    return new SubTaskModel(data).save();
};

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

    await UserService.awardPoints(userId, POINTS_COMMENT_TO_COMMENT_CREATOR); // Comment creator
    await UserService.awardPoints(post.author, POINTS_COMMENT_TO_POST_CREATOR); // Post creator
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

    await UserService.awardPoints(authorId, POINTS_COMMENT_TO_COMMENT_CREATOR * -1);
    await UserService.awardPoints(post.author.id, POINTS_COMMENT_TO_POST_CREATOR * -1);

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
