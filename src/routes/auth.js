const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));
router.get('/refresh', passport.authenticate('jwt', { session: false }), AuthController.refreshToken);
router.get('/check', passport.authenticate('jwt', { session: false }), AuthController.checkAuth);

module.exports = router;
