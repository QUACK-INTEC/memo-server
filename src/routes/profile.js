const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const ProfileController = require('../controllers/ProfileController.js');

const router = express.Router();

router.get('/:id', passport.authenticate('jwt', { session: false }), asyncHandler(ProfileController.getProfile));

module.exports = router;
