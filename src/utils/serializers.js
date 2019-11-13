const serializeUser = (userObj) => ({
    id: userObj.id,
    email: userObj.email,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    points: userObj.points,
});

const serializeSection = (obj) => ({
    id: obj.id,
    professorName: obj.professorName,
    schedule: obj.schedule,
    classRoom: obj.classRoom,
    code: obj.code,
    active: obj.active,
});

const serializeSectionStudent = (s) => ({
    id: s._id,
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.email,
    points: s.points,
});

const serializeSectionPost = (p) => ({
    title: p.title,
    description: p.description,
    startDate: p.startDate,
    endDate: p.endDate,
    type: p.type,
    author: p.author,
    reactions: p.reactions,
});


module.exports = {
    serializeUser,
    serializeSection,
    serializeSectionStudent,
    serializeSectionPost,
};
