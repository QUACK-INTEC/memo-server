const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/sections', require('./sections'));
router.use('/sync', require('./sync'));

module.exports = router;
