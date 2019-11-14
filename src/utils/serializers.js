const serializeUser = (userObj) => ({
    id: userObj.id,
    email: userObj.email,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    points: userObj.points,
});

const serializeSchedule = (obj) => ({
    monday: obj.monday ? { from: obj.monday.from, to: obj.monday.to } : undefined,
    tuesday: obj.tuesday ? { from: obj.tuesday.from, to: obj.tuesday.to } : undefined,
    wednesday: obj.wednesday ? { from: obj.wednesday.from, to: obj.wednesday.to } : undefined,
    thursday: obj.thursday ? { from: obj.thursday.from, to: obj.thursday.to } : undefined,
    friday: obj.friday ? { from: obj.friday.from, to: obj.friday.to } : undefined,
    saturday: obj.saturday ? { from: obj.saturday.from, to: obj.saturday.to } : undefined,
});

const serializeSection = (obj) => ({
    id: obj._id,
    professorName: obj.professorName,
    schedule: serializeSchedule(obj.schedule),
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
