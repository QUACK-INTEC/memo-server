const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');

const { uploadAtt, uploadProfile } = require('../utils/uploadMiddleware');
const UploadController = require('../controllers/UploadController');

const router = express.Router();

router.post('/attachments', passport.authenticate('jwt', { session: false }), uploadAtt, asyncHandler(UploadController.uploadAttachments));
router.post('/profile', passport.authenticate('jwt', { session: false }), uploadProfile, asyncHandler(UploadController.uploadProfile));

module.exports = router;
