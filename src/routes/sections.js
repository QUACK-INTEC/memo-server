const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const SectionController = require('../controllers/SectionController');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), asyncHandler(SectionController.getMySections));
router.get('/:id', passport.authenticate('jwt', { session: false }), asyncHandler(SectionController.sectionDetails));
router.get('/:id/students', passport.authenticate('jwt', { session: false }), asyncHandler(SectionController.sectionStudents));
router.get('/:id/posts', passport.authenticate('jwt', { session: false }), asyncHandler(SectionController.sectionPosts));

module.exports = router;
