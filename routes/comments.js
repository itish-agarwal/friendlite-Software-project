const express = require('express');

const router = express.Router();

const passport = require('passport');

const commentsController = require('../controllers/comments_controller');

//do not let user post if not signed in
router.post('/create', passport.checkAuthentication, commentsController.create);

router.get('/destroy/:id', commentsController.destroy);

module.exports = router;