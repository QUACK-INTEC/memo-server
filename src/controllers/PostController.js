
const SectionService = require('../services/SectionService');
const PostService = require('../services/PostService');
const UserService = require('../services/UserService');
const { serializePost, serializeTask, serializeComment } = require('../utils/serializers');

const ForbiddenError = require('../constants/errors/ForbiddenError');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');
const MissingFieldError = require('../constants/errors/MissingFieldError');

const { POINTS_PER_POST } = require('../constants/points');

const create = async (req, res) => {
    const {
        title,
        description,
        startDate,
        endDate,
        type,
        section,
        attachments,
        isPublic,
    } = req.body;

    if (!title || !type || isPublic === undefined || !section) {
        throw new MissingFieldError('Campos faltantes');
    }

    if ((type === 'Event' && !endDate)) {
        throw new MissingFieldError('Fecha de finalización es requerida');
    }

    let students = await SectionService.findSectionsStudents(section);
    students = students.map((s) => String(s._id));
    if (!students.includes(String(req.user.id))) {
        throw new ForbiddenError('Usted no es parte de esta sección');
    }

    const post = await PostService.create({
        title,
        description,
        startDate,
        endDate,
        type,
        section,
        attachments,
        isPublic,
        author: req.user.id,
    });

    await UserService.awardPoints(post.author, POINTS_PER_POST);

    res.json({
        success: true,
        data: serializePost(post),
    });
};

const update = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        startDate,
        endDate,
        type,
        section,
        attachments,
        isPublic,
    } = req.body;

    if (!title || !type || isPublic === undefined || !section) {
        throw new MissingFieldError('Campos faltantes');
    }

    if (type === 'Event' && !(new Date(endDate)).getDate()) {
        throw new InvalidFieldError('Fecha de finalización no es válida');
    }

    const post = await PostService.findById(id);
    if (String(post.author._id) !== String(req.user.id)) {
        throw new ForbiddenError('Este post no le pertenece');
    }

    const updated = await PostService.update({
        id,
        title,
        description,
        startDate,
        endDate,
        type,
        section,
        attachments,
        isPublic,
        author: req.user.id,
    });
    res.json({
        success: true,
        data: serializePost(updated),
    });
};

const details = async (req, res) => {
    const { id } = req.params;
    const data = await PostService.findById(id, req.user.id);
    res.json({
        success: true,
        data: serializePost(data),
    });
};

const deletePost = async (req, res) => {
    const { id } = req.params;

    const post = await PostService.findById(id);
    if (String(post.author._id) !== String(req.user.id)) {
        throw new ForbiddenError('Este post no le pertenece');
    }

    const result = await PostService.deletePost(id);
    await UserService.awardPoints(post.author, -POINTS_PER_POST);

    const success = result.ok > 0 && result.n > 0;
    res.json({
        success,
    });
};

const upVote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await PostService.upVote(id, userId);
    res.json({
        success: result.ok > 0 && result.n > 0,
    });
};

const downVote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await PostService.downVote(id, userId);
    res.json({
        success: result.ok > 0 && result.n > 0,
    });
};

const resetVote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await PostService.resetVote(id, userId);
    res.json({
        success: result.ok > 0 && result.n > 0,
    });
};

const upVoteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const result = await PostService.upVoteComment(commentId, userId);
    res.json({
        success: result.ok > 0 && result.n > 0,
    });
};

const downVoteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const result = await PostService.downVoteComment(commentId, userId);
    res.json({
        success: result.ok > 0 && result.n > 0,
    });
};

const resetVoteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const result = await PostService.resetVoteComment(commentId, userId);
    res.json({
        success: result.ok > 0 && result.n > 0,
    });
};

const addSubtask = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new MissingFieldError('El nombre de la tarea es requerida!');
    }

    const task = await PostService.addSubtask({
        name,
        post: req.params.postId,
        author: req.user.id,
    });
    res.json({
        success: true,
        task: serializeTask(task),
    });
};

const updateSubtask = async (req, res) => {
    const { postId, taskId } = req.params;
    const { isDone } = req.body;

    if (isDone === undefined) {
        throw new MissingFieldError('Debe especificar si la tarea fue completada o no');
    }

    const taskData = {
        _id: taskId,
        post: postId,
        author: req.user.id,
        isDone,
    };

    const updatedTask = await PostService.updateSubtask(taskData);

    res.json({
        success: true,
        task: serializeTask(updatedTask),
    });
};

const deleteSubtask = async (req, res) => {
    const { postId, taskId } = req.params;
    res.json({
        success: await PostService.deleteSubtask(taskId, postId, req.user.id),
    });
};

const addComment = async (req, res) => {
    const { body } = req.body;

    if (!body) {
        throw new MissingFieldError('Debe especificar el mensaje del comentario!');
    }

    const comment = await PostService.addComment(req.params.postId, req.user.id, body);

    res.json({
        success: true,
        comment: serializeComment(comment),
    });
};

const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;

    res.json({
        success: await PostService.deleteComment(postId, req.user.id, commentId),
    });
};

module.exports = {
    create,
    update,
    details,
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
