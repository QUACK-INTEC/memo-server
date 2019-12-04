const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const CalendarController = require('../controllers/CalendarController');

const router = express.Router();

router.get('/:date', passport.authenticate('jwt', { session: false }), asyncHandler(CalendarController.getEventsByDate));

module.exports = router;
