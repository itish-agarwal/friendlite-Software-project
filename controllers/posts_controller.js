const Post = require('../models/post');
const Comment = require('../models/comment');
const Like = require('../models/like');

let T = 400;

module.exports.create = async function(req, res) {
    // Post.create({
    //     content: req.body.content,
    //     user: req.user._id      //req.user by default contains the user (courtesy of passport);
    // }, function(err, post) {
    //     if(err) {
    //         console.log("Error in creating a post");
    //         return;
    //     }
    //     return res.redirect('back');
    // });

    try {
        let post = await Post.create({
            content: req.body.content,
            user: req.user._id      //req.body by default contains the user (courtesy of passport);
        });

        //detect if request is a xhr request -> xml http request
        if(req.xhr) {

            post = await post.populate('user', 'name').execPopulate();

            return res.status(200).json({
                data: {
                    post: post
                },
                message: "Post created!"
            }); 
        }

    } catch(err) {
        req.flash('error', err);
        return res.redirect('back');
    }
}


module.exports.destroy = async function(req, res) {
    //we are sending /posts/destroy/'id of post'

    //so send as /posts/destroy/:id
    try {

        let post = await Post.findById(req.params.id);
        
            //am i allowed to delete the post?
            //ideally it should be req.user._id, but mongoose already gives a string variant of id
            //ie, req.user.id
        if(post.user == req.user.id) {
            //.id means converting object id into string
            //conversion to string is good for comparision

            //delete all likes made on this post;
            await Like.deleteMany({likeable: post, onModel: 'Post'});
            await Like.deleteMany({_id: {$in: post.comments}});

            post.remove();
            //delete all the comments related to this post

            await Comment.deleteMany({post: req.params.id});
         
            if(req.xhr) {
                // req.flash('success', 'Post deleted');
                return res.status(200).json({
                    data: {
                        post_id: req.params.id
                    },
                    message: "Post deleted successfully"
                });           
            }            

            return res.redirect('back');

        } else {

            req.flash('success', 'You cannot delete this post');

            return res.redirect('back');
        }
    } catch(err) {
        req.flash('error', err);
        return res.redirect('back');
    }
}