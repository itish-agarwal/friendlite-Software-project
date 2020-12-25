const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');


//we need to tell passport to use this local strategy that we have created


//authentication using passport
passport.use(new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true   //this basically allows us to set first parameter of function as 'req';
    },
    function(req, email, password, done) {
        //done is the callback function

        //find a user and establish the identity

        User.findOne({email: email}, function(err, user) {
            if(err) {
                req.flash('error', err);
                return done(err);
            }

            //user not found
            if(!user || user.password!=password) {  
                req.flash('error', 'Invalid username/password');
                return done(null, false);
            }

            //valid user found
            return done(null, user);
        });
    }
));



//we need 2 more functions
//serialize function and de-serialize function

//crypting id of user into cookie -> serializing
//decrypting id of user when sent to server -> deserializing



//serializing the user to decide which key is to be kept in the cookies

passport.serializeUser(function(user, done) {
    // console.log("IN SERIALIZE Fn: ", user.id, user._id);
    done(null, user.id);
});



//deserializing the user from the key in the cookies
passport.deserializeUser(function(id, done) {

    User.findById(id, function(err, user) {
        if(err) {
            console.log("Error in deserializing fn in finding user");
            return done(err);
        }
        return done(null, user);
    });
});




//now send data of logged in user to the server to display in views
//used as a middleware
passport.checkAuthentication = function(req, res, next) {
    //find if requested is authenticated
    //inbuilt function -> isAuthenticated
    if(req.isAuthenticated()) {
        //let user pass onto next thing
        return next();
    }

    //not signed in
    return res.redirect('/users/sign-in');
}

//Whenever a user is signed in, that user's info is available in req.user
//But to send it into the response, we need to set res.locals.user = req.user


passport.setAuthenticatedUser = function(req, res, next) {
    if(req.isAuthenticated()) {
    
        console.log(req.user);
        //req.user contains the current signed in user from the session cookie
        //we are just sending it to the locals for the view
        res.locals.user = req.user;
    }
    next();
}




module.exports = passport;


