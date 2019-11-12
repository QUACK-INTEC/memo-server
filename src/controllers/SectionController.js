
const SectionService = require('../services/SectionService');
const { serializeSection } = require('../utils/serializers');

const getMySections = async (req, res) => {
    const { id } = req.user;

    const sections = await SectionService.findMySections(id);
    res.json({
        success: true,
        sections: sections.map((section) => serializeSection(section)),
    });
};


module.exports = {
    getMySections,
};
