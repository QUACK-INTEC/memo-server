const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const PostController = require('../controllers/PostController');

const router = express.Router();

router.get('/:id', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.details));
router.post('/', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.create));
router.put('/:id', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.update));
router.delete('/:id', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.deletePost));

module.exports = router;
