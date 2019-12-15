const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const PostController = require('../controllers/PostController');

const router = express.Router();

router.get('/:id', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.details));
router.post('/', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.create));
router.put('/:id', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.update));
router.delete('/:id', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.deletePost));

router.post('/:id/upvote', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.upVote));
router.post('/:id/downvote', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.downVote));
router.post('/:id/resetvote', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.resetVote));

router.post('/:postId/comment', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.addComment));
router.delete('/:postId/comment/:commentId', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.deleteComment));

router.post('/comments/:commentId/upvote', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.upVoteComment));
router.post('/comments/:commentId/downvote', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.downVoteComment));
router.post('/comments/:commentId/resetvote', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.resetVoteComment));


router.post('/:postId/subtask', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.addSubtask));
router.put('/:postId/subtask/:taskId', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.updateSubtask));
router.delete('/:postId/subtask/:taskId', passport.authenticate('jwt', { session: false }), asyncHandler(PostController.deleteSubtask));

module.exports = router;
