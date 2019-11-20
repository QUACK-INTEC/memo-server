
const SectionService = require('../services/SectionService');
const PostService = require('../services/PostService');
const { serializePost } = require('../utils/serializers');

const ForbiddenError = require('../constants/errors/ForbiddenError');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const create = async (req, res) => {
    const {
        title,
        description,
        startDate,
        endDate,
        type,
        section,
        attachments,
    } = req.body;

    if (type === 'Event' && !(new Date(endDate)).getDate()) {
        throw new InvalidFieldError('Fecha de finalización no es válida');
    }

    const students = await SectionService.findSectionsStudents(section);
    if (!students.includes(req.user.id)) {
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
        author: req.user.id,
    });
    res.json({
        success: true,
        data: post,
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
    } = req.body;

    if (type === 'Event' && !(new Date(endDate)).getDate()) {
        throw new InvalidFieldError('Fecha de finalización no es válida');
    }

    const post = await PostService.findById(id);
    if (post.author !== req.user.id) {
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
        author: req.user.id,
    });
    res.json({
        success: true,
        data: updated,
    });
};

const details = async (req, res) => {
    const { id } = req.params;
    const data = await PostService.findById(id);
    res.json({
        success: true,
        data: serializePost(data),
    });
};

const deletePost = async (req, res) => {
    const { id } = req.params;

    const post = await PostService.findById(id);
    if (post.author !== req.user.id) {
        throw new ForbiddenError('Este post no le pertenece');
    }

    const result = await PostService.deletePost(id);
    const success = result.ok > 0 && result.n > 0;
    res.json({
        success,
    });
};

module.exports = {
    create,
    update,
    details,
    deletePost,
};
