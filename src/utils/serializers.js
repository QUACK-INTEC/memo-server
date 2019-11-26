const serializeUser = (userObj) => ({
    id: userObj._id,
    avatarURL: userObj.avatarURL,
    email: userObj.email,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    points: userObj.points,
});

const serializeAttachment = (att) => ({
    id: att._id,
    fileURL: att.fileURL,
    name: att.name,
});

const serializeTask = (task) => ({
    id: task._id,
    name: task.name,
    isDone: task.isDone,
});

const totalReactions = (total, current) => total + current.value;

const serializeComment = (c) => ({
    id: c._id,
    body: c.body,
    score: c.reactions.reduce(totalReactions, 0),
    currentUserReaction: c.currentUserReaction && c.currentUserReaction.value,
    author: serializeUser(c.author),
});
const serializeSimplePost = (p) => ({
    id: p._id,
    title: p.title,
    startDate: p.startDate,
    endDate: p.endDate,
    type: p.type,
    author: serializeUser(p.author),
    currentUserReaction: p.currentUserReaction && p.currentUserReaction.value,
    isPublic: p.isPublic,
});

const serializePost = (p) => ({
    ...serializeSimplePost(p),
    description: p.description,
    score: p.reactions.reduce(totalReactions, 0),
    comments: p.comments.map(serializeComment),
    attachments: p.attachments.map(serializeAttachment),
    subtasks: p.subtasks.map(serializeTask),
});

const serializeSchedule = (obj) => ({
    monday: obj.monday ? { from: obj.monday.from, to: obj.monday.to } : undefined,
    tuesday: obj.tuesday ? { from: obj.tuesday.from, to: obj.tuesday.to } : undefined,
    wednesday: obj.wednesday ? { from: obj.wednesday.from, to: obj.wednesday.to } : undefined,
    thursday: obj.thursday ? { from: obj.thursday.from, to: obj.thursday.to } : undefined,
    friday: obj.friday ? { from: obj.friday.from, to: obj.friday.to } : undefined,
    saturday: obj.saturday ? { from: obj.saturday.from, to: obj.saturday.to } : undefined,
});

const serializeSubject = (obj) => ({
    id: obj._id,
    code: obj.code,
    name: obj.name,
    university: obj.university,
});

const serializeSection = (obj) => ({
    id: obj._id,
    professorName: obj.professorName,
    schedule: serializeSchedule(obj.schedule),
    classRoom: obj.classRoom,
    code: obj.code,
    active: obj.active,
    subject: serializeSubject(obj.subject),
});

const serializeSectionStudent = (s) => ({
    id: s._id,
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.email,
    points: s.points,
});

const serializeUniversity = (uni) => ({
    id: uni._id,
    title: uni.title,
    syncCode: uni.name,
});


module.exports = {
    serializeUser,
    serializeSection,
    serializeSectionStudent,
    serializeUniversity,
    serializeSimplePost,
    serializePost,
    serializeAttachment,
    serializeTask,
};
