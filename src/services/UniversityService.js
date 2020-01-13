const winston = require('winston');

const {
    UniversityModel,
    SectionModel,
    PostModel,
    SubjectModel,
} = require('../models');

const InvalidFieldError = require('../constants/errors/InvalidFieldError');

const findByName = async (universityName) => {
    const university = await UniversityModel.findOne({ name: universityName }).lean().exec();
    if (university) {
        return university;
    }
    throw new InvalidFieldError('La universidad no existe');
};

const getAll = async () => UniversityModel.find().lean().exec();

const updateDiscriminator = async (universityId, discriminator) => {
    const previous = await UniversityModel.findByIdAndUpdate(
        universityId, { discriminator },
    ).lean().exec();

    const oldDiscriminator = previous.discriminator;
    if (oldDiscriminator !== discriminator) {
        // TRIMESTER CHANGED!!

        (async () => {
            winston.log('info', `NEW DISCRIMINATOR FOR ${previous.name} (${oldDiscriminator} => ${discriminator}) TRIGGERING CLEANUP`);

            // 1 - INACTIVATE OLD SECTIONS
            const subjects = await SubjectModel.find({ university: universityId }).lean().exec();
            const sections = await SectionModel.find({
                subject: { $in: subjects.map((s) => s._id) },
                discriminator: oldDiscriminator,
            }).lean().exec();

            const sectionIds = sections.map((s) => s._id);

            const inactiveRes = await SectionModel.updateMany(
                { _id: { $in: sectionIds } },
                { active: false },
            ).exec();

            winston.log('info', `(CLEANUP) SECTIONS SET INACTIVE: ${inactiveRes.nModified} sections`);

            // 2 - DELETE POSTS THAT WILL NOT BE PERMANENT
            const postsBySection = await PostModel.aggregate([
                {
                    $match: {
                        section: { $in: sectionIds },
                    },
                },
                {
                    $group: {
                        _id: '$section',
                        posts: {
                            $push: '$$ROOT',
                        },
                    },
                },
            ]).exec();

            let postsToDelete = [];

            postsBySection.forEach((section) => {
                const { posts } = section;

                const ineligiblePosts = [];
                posts.forEach((post) => {
                    if (!post.isPublic || !post.attachments || post.attachments.length === 0) {
                        ineligiblePosts.push(post._id);
                    }
                });

                const eligiblePosts = posts
                    .filter((p) => !ineligiblePosts.includes(p._id))
                    .sort((a, b) => {
                        const reducer = (total, current) => total + current.value;

                        const aPoints = a.reactions ? a.reactions.reduce(reducer, 0) : 0;
                        const bPoints = b.reactions ? b.reactions.reduce(reducer, 0) : 0;

                        return bPoints - aPoints;
                    });

                const keepCount = Math.ceil(eligiblePosts.length * 0.10);
                const eligibleToDelete = eligiblePosts
                    .splice(keepCount, eligiblePosts.length - keepCount);
                const toDelete = [...eligibleToDelete.map((p) => p._id), ...ineligiblePosts];

                winston.log('info', `(SECTION CLEANUP) ${section._id} - TOTAL POSTS: ${posts.length} - INELIGIBLE: ${ineligiblePosts.length} - KEEPING (10%): ${keepCount} - DELETING: ${toDelete.length}`);

                postsToDelete = [...postsToDelete, ...toDelete];
            });

            const deleteRes = await PostModel.deleteMany({ _id: { $in: postsToDelete } }).exec();

            winston.log('info', `POST CLEANUP TOTAL: ${deleteRes.n} deleted / ${postsToDelete.length} to delete`);
        })();
    }
};

const getLastDiscriminator = async (universityId) => {
    const { discriminator } = await UniversityModel.findById(universityId).lean().exec();
    return discriminator;
};

module.exports = {
    findByName,
    getAll,
    updateDiscriminator,
    getLastDiscriminator,
};
