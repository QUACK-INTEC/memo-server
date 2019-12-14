const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));
router.post('/otp', asyncHandler(AuthController.otp));
router.get('/refresh', passport.authenticate('jwt', { session: false }), AuthController.refreshToken);
router.get('/check', passport.authenticate('jwt', { session: false }), AuthController.checkAuth);
router.post('/forgot', passport.authenticate('jwt', { session: false }), AuthController.forgotPassword);
router.post('/reset', passport.authenticate('jwt', { session: false }), AuthController.resetPassword);

module.exports = router;
