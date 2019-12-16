const UniHook = require('../unihook');

const UniversityService = require('../services/UniversityService');
const SubjectService = require('../services/SubjectService');
const SectionService = require('../services/SectionService');

const { serializeSection, serializeUniversity } = require('../utils/serializers');

const InvalidFieldError = require('../constants/errors/InvalidFieldError');
const MissingFieldError = require('../constants/errors/MissingFieldError');

const sync = async (req, res) => {
    const { username, password, university } = req.body;

    if (!username || !password || !university) {
        throw new MissingFieldError('Missing fields');
    }

    if (university !== 'intec') {
        throw new InvalidFieldError('La universidad especificada no es soportada');
    }

    const uniData = await UniHook[university](username, password);
    const universityModel = await UniversityService.findByName(university);

    const { schedule, discriminator } = uniData;
    const sectionsPromises = schedule.map(async (sectionData) => {
        const subject = await SubjectService.updateOrCreate(
            universityModel._id,
            sectionData.code,
            sectionData.name,
        );
        const section = await SectionService.updateOrCreate({
            active: true,
            code: sectionData.section,
            subject: subject._id,
            professorName: sectionData.professor,
            schedule: sectionData.schedule,
            classRoom: sectionData.room,
            discriminator,
        });

        await SectionService.joinSection(section._id, req.user.id);

        return section;
    });

    const sections = await Promise.all(sectionsPromises);

    res.json({ sections: sections.map(serializeSection) });
};

const getUniversities = async (req, res) => {
    const universities = await UniversityService.getAll();
    res.json({ universities: universities.map(serializeUniversity) });
};

module.exports = {
    sync,
    getUniversities,
};
