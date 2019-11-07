const serializeUser = (userObj) => ({
    id: userObj.id,
    email: userObj.email,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    points: userObj.points,
});

module.exports = {
    serializeUser,
};
