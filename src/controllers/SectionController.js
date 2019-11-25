const SectionService = require('../services/SectionService');
const { serializeSection, serializeSectionStudent, serializeSimplePost } = require('../utils/serializers');

const getMySections = async (req, res) => {
    const { id } = req.user;

    const sections = await SectionService.findMySections(id);
    res.json({
        success: true,
        data: sections.map((section) => serializeSection(section)),
    });
};

const sectionDetails = async (req, res) => {
    const { id } = req.params;
    const section = await SectionService.findById(id);
    res.json({
        success: true,
        data: serializeSection(section),
    });
};

const sectionStudents = async (req, res) => {
    const { id } = req.params;
    const students = await SectionService.findSectionsStudents(id);
    res.json({
        success: true,
        data: students.map((s) => (serializeSectionStudent(s))),
    });
};

const sectionPosts = async (req, res) => {
    const { id } = req.params;
    const posts = await SectionService.findSectionsPosts(id, req.user.id);
    res.json({
        success: true,
        data: posts.map((p) => (serializeSimplePost(p))),
    });
};

module.exports = {
    getMySections,
    sectionDetails,
    sectionStudents,
    sectionPosts,
};
