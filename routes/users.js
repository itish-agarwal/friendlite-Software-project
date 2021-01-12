const express = require('express');
const { user, pass } = require('../config/mongoose');


const router = express.Router();

const passport = require('passport');

const usersController = require('../controllers/users_controller');

router.get('/profile/:id', passport.checkAuthentication, usersController.profile);

router.post('/update/:id', passport.checkAuthentication, usersController.update);

router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);


router.post('/create', usersController.create);


//create a session
router.post('/create-session', /*middleware*/ passport.authenticate(
    'local',
    {failureRedirect: '/users/sign-in'},
), usersController.createSession);

//sign-out
router.get('/sign-out', usersController.destroySession);

//forgot password
router.get('/forgot-password', usersController.getEnterEmailPage);

//reset-password-controller
router.post('/reset-password', usersController.resetPassword);

router.get('/reset-password-form/', usersController.getPasswordResetPage);

router.post('/change-password', usersController.changePassword);

//path is given by google (not the callback url)
router.get('/auth/google', passport.authenticate('google', {
    scope: [
        'profile',
        'email'
    ]
}));

//this is url at which i will receive the data
router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/users/sign-in'
}), usersController.createSession);



//friend request
router.get('/friend-request', usersController.toggleFriendship);

//get user posts
router.get('/posts/:id', passport.checkAuthentication, usersController.getUserPosts);


module.exports = router;