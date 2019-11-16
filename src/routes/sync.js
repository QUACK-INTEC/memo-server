const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const SyncController = require('../controllers/SyncController');

const router = express.Router();

router.post('/', passport.authenticate('jwt', { session: false }), asyncHandler(SyncController.sync));
router.get('/universities', passport.authenticate('jwt', { session: false }), asyncHandler(SyncController.getUniversities));

module.exports = router;
