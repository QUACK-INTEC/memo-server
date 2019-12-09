const AttachmentService = require('../services/AttachmentService');
const UserService = require('../services/UserService');

const { serializeAttachment, serializeUser } = require('../utils/serializers');

const MissingFieldError = require('../constants/errors/MissingFieldError');

const uploadAttachments = async (req, res) => {
    if (!req.files) {
        throw new MissingFieldError('Debe especificar al menos un archivo a subir!');
    }

    const customNames = Array.isArray(req.body.names) ? req.body.names : [req.body.names];
    const useCustomNames = customNames && req.files.length === customNames.length;

    const attachmentPromises = req.files.map((file, idx) => AttachmentService.create({
        fileURL: file.location,
        name: useCustomNames ? customNames[idx] || file.originalname : file.originalname,
        uploadedBy: req.user.id,
    }));

    const attachments = await Promise.all(attachmentPromises);

    res.json({ success: true, attachments: attachments.map(serializeAttachment) });
};

const uploadProfile = async (req, res) => {
    if (!req.file) {
        throw new MissingFieldError('Debe especificar una imagen a subir!');
    }
    const usr = await UserService.updateAvatar(req.user.id, req.file.location);
    res.json({ success: true, data: serializeUser(usr) });
};

module.exports = {
    uploadAttachments,
    uploadProfile,
};
