const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Friendship = require('../models/friendship');

module.exports.home = async function(req, res) {   
  
    try{
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


        for(post of posts ){
            for(comment of post.comments) {
                comment = await comment.populate('user', 'name email').execPopulate();
            }
            // await Comment.find({post: post._id}).sort('-createdAt');
            post.comments.reverse(); //so that newer comments are displayed first;
        }

        //now comes the callback function
        //now callback is basically something that tells something is completed and then move on
        //ie, if there are 2 fns a and b, callback of a is a signal for b to start occuring

        //so here using await, we have handled all callbacks -> ie, unless all fns before x
        //are executed, x cannot execute

        let all_friends = [], all_non_friends = [];

        let users = await User.find({}).populate({
            path: 'friendships', 
            populate: {
                path: 'from_user'
            },
            populate: {
                path: 'to_user'
            }
        });
        
        let originalUser = req.user;

        if(originalUser) {
            for(user of users) {
                let isFriend = 0;
                for(friendship of user.friendships) {
                    if(((friendship.from_user==originalUser.id)&&(friendship.to_user.id==user.id)) || ((friendship.from_user==user.id)&&(friendship.to_user.id==originalUser.id))) {
                        isFriend = 1;
                    } 
                }
                // console.log("DDDDDDDDDDDDDDDDDDDDDDDDDD ", user.id);
                if(isFriend) {
                    all_friends.push(user);
                } else {
                    all_non_friends.push(user);
                }
            }
        }

        return res.render('home', {
            title: "Codeial | Home",
            back: '/',
            posts: posts,
            all_friends: all_friends,
            all_non_friends: all_non_friends
        });

    }catch(err) {
        console.log("home_controller->home", err);
        return;
    }    
}