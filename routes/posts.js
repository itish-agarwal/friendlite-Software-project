const express = require('express');

const router = express.Router();

const passport = require('passport');

const postsController = require('../controllers/posts_controller');

//do not let user post if not signed in
router.post('/create', passport.checkAuthentication, postsController.create);

router.get('/destroy/:id', passport.checkAuthentication, postsController.destroy);

module.exports = router;