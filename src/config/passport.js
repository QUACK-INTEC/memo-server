const { Strategy, ExtractJwt } = require('passport-jwt');
const UserService = require('../services/UserService');

const { AUTH_SECRET } = require('./config');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: AUTH_SECRET, // FIXME proper auth secret handling with env vars
};

const Auth = (passport) => {
    passport.use(
        new Strategy(opts, (payload, done) => {
            UserService.findById(payload.id)
                .then((user) => {
                    if (user) {
                        return done(null, {
                            id: user._id,
                            email: user.email,
                        });
                    }
                    return done(null, false);
                });
        }),
    );
};

module.exports = Auth;
