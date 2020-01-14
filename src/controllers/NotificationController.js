const NotificationService = require('../services/NotificationService');

const MissingFieldError = require('../constants/errors/MissingFieldError');

const registerToken = async (req, res) => {
    const { pushToken } = req.body;

    if (!pushToken) {
        throw new MissingFieldError('Debe especificar un token!');
    }

    await NotificationService.registerToken(req.user.id, pushToken);

    res.json({ success: true });
};

const unregisterToken = async (req, res) => {
    await NotificationService.unregisterToken(req.user.id);
    res.json({ success: true });
};


module.exports = {
    registerToken,
    unregisterToken,
};
