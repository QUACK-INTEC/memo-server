const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const SyncController = require('../controllers/SyncController');
const cacheMiddleware = require('./redisMiddleware');

const router = express.Router();

router.post('/', passport.authenticate('jwt', { session: false }), asyncHandler(SyncController.sync));
router.get('/universities', cacheMiddleware(60000), passport.authenticate('jwt', { session: false }), asyncHandler(SyncController.getUniversities));
router.get('/check', passport.authenticate('jwt', { session: false }), asyncHandler(SyncController.checkRequired));

module.exports = router;
