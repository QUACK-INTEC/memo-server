const UserService = require('../services/UserService');
const SectionService = require('../services/SectionService');

const { serializeUser, serializeSection } = require('../utils/serializers');

const getOwnProfile = async (req, res) => {
    const user = await UserService.findById(req.user.id);

    res.json({
        user: serializeUser(user),
    });
};

const getProfile = async (req, res) => {
    const { id } = req.params;

    const user = await UserService.findById(id);
    const sections = await SectionService.getCommonSections(req.user.id, id);

    res.json({
        user: serializeUser(user),
        commonClasses: sections.map(serializeSection),
    });
};

module.exports = {
    getProfile,
    getOwnProfile,
};
