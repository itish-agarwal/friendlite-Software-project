const User = require('../models/user');
const fs = require('fs');
const path = require('path');

const usersSignInMailer = require('../mailers/registration_successful_mailer');

const forgotPasswordMailer = require('../mailers/forgot_password_mailer');

const resetPasswordToken = require('../models/reset_password_token');
const { user } = require('../config/mongoose');
const Friendship = require('../models/friendship');

const Message = require('../models/message');
const { version } = require('os');
const { post } = require('../routes/users');
const Post = require('../models/post');

let T = 400;

//do not convert to async
module.exports.profile = async function(req, res) {

    try {

        let originalUser = req.user;

        let requestedUser = await User.findById(req.params.id).populate('friendships');

        let shouldAdd = "Add";

        for(friendship of requestedUser.friendships) {
            if(((friendship.from_user==originalUser.id)&&(friendship.to_user==requestedUser.id)) || ((friendship.from_user==requestedUser.id)&&(friendship.to_user==originalUser.id))) {
                shouldAdd = "Remove";
            }
        }

        let messages = await Message.find({}).sort('-createdAt');
        
        let messagesArray = [];

        for(message of messages) {

            let a = message.createdAt;
            console.log("FFFFFFFFFFFFFFFFFFFFFFFFF - ", a);

            if(message.from_user==originalUser.id && message.to_user==requestedUser.id) {

                messagesArray.push({
                    time: message.createdAt,
                    id: message._id,
                    content: message.content,
                    type: 1
                });
            } else if(message.from_user==requestedUser.id && message.to_user==originalUser.id) {
                messagesArray.push({
                    time: message.createdAt,
                    id: message._id,
                    content: message.content,
                    type: 2
                });
            }
        }
        

        User.findById(req.params.id, function(err, user) {
            return res.render('user_profile', {
                back: '/',
                title: user.name,
                profile_user: user,
                shouldAdd: shouldAdd,
                messagesArray: messagesArray
            });
        });

    }catch(err) {
        console.log("Error in users_controller->profile ", err);
        return;
    }    
}



//just one callback 
//allow user to update his/her info
module.exports.update = async function(req, res) {


    if(req.user.id == req.params.id) { 
        
        try {

            let user = await User.findById(req.params.id);

            //now req.body cannot parse multipart files
            User.uploadedAvatar(req, res, function(err) {

                if(err) {
                    console.log("MULTERRRR ERR ", err);
                } else {
                    
                    user.name = req.body.name;
                    user.email = req.body.email;
                    if(req.file) {

                        if(user.avatar) {
                            //delete the avatar (to save the space in avatars folder);
                            if(fs.existsSync(path.join(__dirname, '..', user.avatar))) {
                            // user.avatar stores /uploads/users/avatars/filename-date
                                fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                            }

                        }
                        //this is saving the path of the uploaded file into the avatar field of the user
                        user.avatar = User.avatarPath + '/' + req.file.filename;
                    }
                    user.save();
                    req.flash('success', 'Updated profile');
                    setTimeout(function() {
                        return res.redirect('back');
                    }, T+570);
                }    
            });
        }catch(err) {
            req.flash('error', err);
            return res.redirect('back');
        }

    } else {
        req.flash('error', 'Unauthorized');
        return res.status(401).send('Unauthorized');
    }
}


//render sign up page
module.exports.signUp = function(req, res) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    setTimeout(function() {
        return res.render('user_sign_up', {
            title: "Codieal | Sign Up",
            back: '/'
        });
    }, T+90);
}

//render sign in page
module.exports.signIn = function(req, res) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    return res.render('user_sign_in', {
        title: "Codeial | Sign In",
        back: '/'
    });
}

//create a user
module.exports.create = function(req, res) {
    //1st step
    //check if password and confirm_password are the same
    if(req.body.password != req.body.confirm_password) {
        req.flash('error', 'Passwords do not match');
        return res.redirect('back');
    }

    //2nd step
    //check if another use with same email already exists in the database
    User.findOne({email: req.body.email}, function(err, user) {
        if(err) {
            console.log("Error in finding user in signing up");
            return;
        }
        if(!user) {
            User.create(req.body, function(err, user) {
                if(err) {
                    console.log("Error in creating user");
                    return;
                }
                
                usersSignInMailer.registrationSuccessful(user);

                req.flash('success', 'Registered');
                
                setTimeout(function() {
                    return res.redirect('/');
                }, T+2800);
            });
        } else {
            //user already exits

            req.flash('error', 'Email already taken');

            return res.redirect('back');
        }
    });    
}


//sign in and create a session for the user
module.exports.createSession = function(req, res) {
    req.flash('success', 'Logged in successfully');
    //now this message needs to be given to the response->use a middleware
    //create a new middleware in config folder
    setTimeout(function() {
        return res.redirect('/');
    }, T+2000);

}


//sign-out the user
module.exports.destroySession = function(req, res) {
    //built-in function to destroy cookie
    req.logout();
    req.flash('success', 'Logged out successfully');
    return res.redirect('/');    
}




const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}


//forgot password page
module.exports.getEnterEmailPage = function(req, res) {
    setTimeout(function() {
        return res.render('forgot_password', {
            back: '/users/sign-in',
            title: ""
        });
    }, T+350);    
}



//reset password
module.exports.resetPassword = function(req, res) {
                        
    let inputEmail = req.body.email;
    

    User.findOne({email: inputEmail}, function(err, user) {
        if(err) {
            console.log("Error in finding user for resetting password ", err);
            return;
        }
        if(!user) {       
            req.flash('error', 'Email not found');
            return res.redirect('back');
            
        } else {
            
            let s = generateString(20);
            //create a resset password token
            resetPasswordToken.create({

                user: user._id,
                accessToken: s

            }, function(err, token ) {                
                //now that token is generated, send a mail

                forgotPasswordMailer.newToken(token);
                
            });           


            req.flash('success', 'Email sent for reset password');
            setTimeout(function() {
                return res.redirect('back');
            }, T+400);            
        }
    });    
}


//render the password reset form
module.exports.getPasswordResetPage = function(req, res) {
    console.log(req.query.access_token);

    let bool = 1;


    resetPasswordToken.findOne({accessToken: req.query.access_token}, function(err, token) {

        setTimeout(function() {
            return res.render('enter_new_password', {
                title: "Reset password", 
                token: token
            }); 
        }, T+400);               
    });
}



module.exports.changePassword = function(req, res) {

    let access_token = req.body.access_token;

    resetPasswordToken.findOneAndUpdate({accessToken: access_token}, {isValid: false}, function(err, token) {

        if(err) {
            console.log("Error in change password   ", err);
            return;
        }

        if(req.body.password != req.body.confirm_password) {

            return res.redirect('/users/sign-in');
        } else {

            let userId = token.user._id;
            User.findByIdAndUpdate(userId, {password: req.body.password}, function(err, user) {
                console.log(user.password);
                if(err) {
                    console.log("Error in change password 2   ", err);
                    return;
                }
                req.flash('success', 'Password changed!');
                setTimeout(function() {
                    return res.redirect('/users/sign-in');
                }, T+1800);
            });
        }
    });
}


//friendship
module.exports.toggleFriendship = async function(req, res) {


    let from_user = req.user;
    let to_user = req.query.to_user;
    
    let type = req.query.type;
    
    //check if user is already a friend
    if(type=='Add') {
        var friendName="";
        //add a friendship
        Friendship.create({
            from_user: from_user._id,
            to_user: to_user
        }, function(err, friendship) {

            User.findById(from_user._id, function(err, user) {

                user.friendships.push(friendship);
                user.save();
            });
            User.findById(to_user, function(err, user) {
                user.friendships.push(friendship);
                // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX - ", user.name);
                friendName = user.name;
                user.save();
            });            
        });
        req.flash('success', `Added ${friendName} as friend`);

    } else {
        let friendship = await Friendship.findOne({
            from_user: from_user._id,
            to_user: to_user
        });

        if(!friendship) {
            friendship = await Friendship.findOne({
                from_user: to_user,
                to_user: from_user._id
            })
        }
        // friendship.remove();
        //console.log(friendship._id);
    
        let user1 = await User.findByIdAndUpdate(from_user._id, {$pull: {friendships: friendship._id}});
        let user2 = await User.findByIdAndUpdate(to_user, {$pull: {friendships: friendship._id}});
        friendship.remove();
        req.flash('success', `Removed ${user2.name} from friends`);
    }    

    setTimeout(function() {
        return res. redirect('back');
    }, T+300);    
}

//get all posts of a user -> one_user_post.ejs
module.exports.getUserPosts = async function(req, res) {

    try {
        let postUserId = req.params.id;
        if(!req.user) {
            return res.redirect('back');
        }
        let user = await User.findById(postUserId);
        let posts = await Post.find({})
        .sort('-createdAt') //sort according to time
        .populate('user')
        .populate({
            path: 'comments',
            populate: {
                path: 'user'
            },  //('comments' is a property of post)
            populate: {
                path: 'likes'
            }
        }).populate('comments')
        .populate('likes');         
        
        for(p of posts ){
            for(comment of p.comments) {
                comment = await comment.populate('user', 'name email').execPopulate();
            }
            p.comments.reverse(); 
        }


        return res.render('one_user_posts', {
            post_user: user,
            all_posts: posts
        });
    }catch(err) {
        console.log(err);
    }
}