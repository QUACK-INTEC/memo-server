const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/sections', require('./sections'));
router.use('/posts', require('./posts'));
router.use('/sync', require('./sync'));
router.use('/profile', require('./profile'));

module.exports = router;
