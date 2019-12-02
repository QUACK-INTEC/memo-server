
const SubjectService = require('../services/SubjectService');
const { serializeSubjectWithResources } = require('../utils/serializers');

const getPermanentResources = async (req, res) => {
    const { id } = req.params;
    const data = await SubjectService.getPermanentResources(id);
    res.json({
        success: true,
        data: data.map((d) => serializeSubjectWithResources(d)),
    });
};


module.exports = {
    getPermanentResources,
};
