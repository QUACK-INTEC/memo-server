const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/sections', require('./sections'));
router.use('/posts', require('./posts'));
router.use('/subjects', require('./subjects'));
router.use('/sync', require('./sync'));
router.use('/profile', require('./profile'));
router.use('/upload', require('./upload'));
router.use('/calendar', require('./calendar'));

module.exports = router;
