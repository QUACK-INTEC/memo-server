const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const { registerToken } = require('../controllers/NotificationController');

const router = express.Router();

router.post('/register', passport.authenticate('jwt', { session: false }), asyncHandler(registerToken));

module.exports = router;
