const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const { AUTH_SECRET } = require('../config/config');
const UserService = require('../services/UserService');
const { serializeUser } = require('../utils/serializers');

const MissingFieldError = require('../constants/errors/MissingFieldError');
const InvalidFieldError = require('../constants/errors/InvalidFieldError');
const UnauthorizedError = require('../constants/errors/UnauthorizedError');

const genToken = (id, email) => jwt.sign({ id, email }, AUTH_SECRET, {
    expiresIn: 604800, // 1 week
});

const register = async (req, res) => {
    const {
        password, email, firstName, lastName,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
        throw new MissingFieldError('Faltan campos requeridos');
    }

    if (!validator.isEmail(email)) {
        throw new InvalidFieldError('Correo electrónico inválido');
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
        throw new MissingFieldError('Faltan campos requeridos');
    }

    const user = await UserService.findOne({ email });
    if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        res.json({
            success: true,
            token: genToken(user._id, user.email),
            user: serializeUser(user),
        });
    } else {
        throw new UnauthorizedError('La contraseña ingresada es incorrecta');
    }
};

const otp = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new MissingFieldError('Faltan campos requeridos');
    }

    const user = await UserService.findOne({ email });
    if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
    }

    const isLate = (new Date(user.otpExpiration)) < Date.now();
    const isMatch = await bcrypt.compare(password, user.otp || '');
    if (isMatch && !isLate) {
        await UserService.resetOtp(email);
        res.json({
            success: true,
            token: genToken(user._id, user.email),
            user: serializeUser(user),
        });
    } else {
        throw new UnauthorizedError('La contraseña ingresada es incorrecta o expirada');
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

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await UserService.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new MissingFieldError('Email no existe');
    }
    const success = await UserService.sendForgotPasswordEmail(email);
    res.json({ success });
};

const resetPassword = async (req, res) => {
    const {
        password,
    } = req.body;
    const { email } = req.user;

    if (!password) {
        throw new MissingFieldError('Faltan campos requeridos');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userInfo = {
        email: email.toLowerCase(),
        password: hashedPassword,
    };

    const user = await UserService.changePassword(userInfo);
    return res.status(200).json({ user: serializeUser(user) });
};


module.exports = {
    register,
    login,
    refreshToken,
    checkAuth,
    forgotPassword,
    resetPassword,
    otp,
};
