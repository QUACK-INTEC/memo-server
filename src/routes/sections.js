const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const SectionController = require('../controllers/SectionController');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), asyncHandler(SectionController.getMySections));

module.exports = router;
