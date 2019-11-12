const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const { AUTH_SECRET } = require('../config/config');
const UserService = require('../services/UserService');
const { serializeUser } = require('../utils/serializers');

const BadRequestError = require('../constants/errors/BadRequestError');

const genToken = (id, email) => jwt.sign({ id, email }, AUTH_SECRET, {
    expiresIn: 604800, // 1 week
});

const register = async (req, res) => {
    const {
        password, email, firstName, lastName,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
        throw new BadRequestError('Missing fields');
    }

    if (!validator.isEmail(email)) {
        throw new BadRequestError('Missing fields');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userInfo = {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
    };

    const newUser = await UserService.create(userInfo);
    return res.status(200).json({ user: serializeUser(newUser) });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ success: false, msg: 'Missing fields' });
        return;
    }

    const user = await UserService.findOne({ email });
    if (!user) {
        res.status(401).json({ success: false, msg: 'User does not exist' });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        res.json({
            success: true,
            token: genToken(user._id, user.email),
            user: serializeUser(user),
        });
    } else {
        res.status(401).json({ success: false, msg: 'Wrong password' }); // FIXME Error standarization
    }
};

const refreshToken = (req, res) => {
    const { id, email } = req.user;
    res.json({
        success: true,
        token: genToken(id, email),
    });
};

const checkAuth = (req, res) => {
    res.json({ user: req.user });
};

module.exports = {
    register,
    login,
    refreshToken,
    checkAuth,
};
