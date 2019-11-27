const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const SubjectController = require('../controllers/SubjectController');

const router = express.Router();

router.get('/:id/resources', passport.authenticate('jwt', { session: false }), asyncHandler(SubjectController.getPermanentResources));

module.exports = router;
