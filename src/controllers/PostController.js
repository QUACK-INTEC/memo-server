
const PostService = require('../services/PostService');
const { serializePost } = require('../utils/serializers');


const create = async (req, res) => {
    const {
        title,
        description,
        startDate,
        endDate,
        type,
        section,
    } = req.body;

    const attachments = [];

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
    const {
        title,
        description,
        startDate,
        endDate,
        type,
        section,
    } = req.body;

    const attachments = [{ name: 'x', fileURL: '' }];

    const post = await PostService.update({
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
