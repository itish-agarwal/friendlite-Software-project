const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');

const User = require('../models/user');

const env = require('./environment');

const usersSignInMailer = require('../mailers/registration_successful_mailer');

//tell passport to use a new strategy for google auth
console.log(env.google_client_id);
console.log(env.google_client_secret);
console.log(env.google_call_back_url);

passport.use(new googleStrategy({
    
    clientID: env.google_client_id,
    clientSecret: env.google_client_secret,
    callbackURL: env.google_call_back_url
    },

    function(accessToken, refreshToken, profile, done) {
        //profile contains user information
        User.findOne({email: profile.emails[0].value}).exec(function(err, user) {

            if(err) {console.log("Error in google strategy passport: ", err); return}

            console.log(profile);
            if(user) {
                //checking if user with email id exists in the database (our database)
                //if found, set this user as req.user
                return done(null, user);
            } else {

                //create the user: ie: sign in/sign up
                //create the user and set it as req.user

                User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: crypto.randomBytes(20).toString('hex')                        
                }, function(err, user) {
                    if(err) {console.log("Error in creating user via gouth ", err); return;}
                    console.log("**USER CREATED VIA GOOGLE SIGN UP ", user);
                    usersSignInMailer.registrationSuccessful(user);
                    return done(null, user);
                });
            }
        });
    }
));

module.exports = passport;

