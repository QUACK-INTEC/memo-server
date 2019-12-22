const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const { registerToken, unregisterToken } = require('../controllers/NotificationController');

const router = express.Router();

router.post('/register', passport.authenticate('jwt', { session: false }), asyncHandler(registerToken));
router.post('/unregister', passport.authenticate('jwt', { session: false }), asyncHandler(unregisterToken));

module.exports = router;
