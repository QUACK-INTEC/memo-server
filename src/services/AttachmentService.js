const { AttachmentModel } = require('../models');

const create = async (attData) => new AttachmentModel(attData).save();

module.exports = {
    create,
};
