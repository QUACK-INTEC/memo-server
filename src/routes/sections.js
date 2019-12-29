const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const SectionController = require('../controllers/SectionController');
const cacheMiddleware = require('./redisMiddleware');

const router = express.Router();

router.get('/', cacheMiddleware(6000), passport.authenticate('jwt', { session: false }), asyncHandler(SectionController.getMySections));
router.get('/:id', cacheMiddleware(60000), passport.authenticate('jwt', { session: false }), asyncHandler(SectionController.sectionDetails));
router.get('/:id/students', passport.authenticate('jwt', { session: false }), asyncHandler(SectionController.sectionStudents));
router.get('/:id/posts', passport.authenticate('jwt', { session: false }), asyncHandler(SectionController.sectionPosts));

module.exports = router;
