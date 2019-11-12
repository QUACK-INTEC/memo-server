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

module.exports = {
    serializeUser,
    serializeSection,
};
