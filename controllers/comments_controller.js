const Comment = require('../models/comment');
const Post = require('../models/post');
const commentsMailer = require('../mailers/comments_mailer');
const Like = require('../models/like');

const queue = require('../config/kue');

const commentEmailWorker = require('../workers/comment_email_worker');

let T = 400;

module.exports.create = async function(req, res){
    try {
    
        let post = await Post.findById(req.body.post);

        if (post){
            let comment = await Comment.create({
                content: req.body.content,
                post: req.body.post,
                user: req.user._id
            });
                // handle error
                
            post.comments.push(comment);
            post.save();

            comment = await comment.populate('user', 'name email').execPopulate();

            //just need to call commentsMailer now
            // commentsMailer.newComment(comment);

            // let job = queue.create('emails', comment).save(function(err) {
            //     if(err) {
            //         console.log("Error in comments_controller->create->queue ", err);
            //         return;
            //     }
            //     console.log("Job enqueued", job.id);
            // });
            

            if(req.xhr) {               
                setTimeout(function() {
                    return res.status(200).json({
                        data: {
                            comment: comment
                        },
                        message: "Comment created"
                    });
                }, T+75);              
            }
        } else {
            return res.redirect('/');
        }
    } catch(err) {
        console.log("Err ",err);
    }
}


module.exports.destroy = async function(req, res) {

    try {    
        
        let comment = await Comment.findById(req.params.id).populate('post');

        if(comment.user == req.user.id || comment.post.user == req.user.id) {
            //user can delete
            //now find the post to which this comment belongs -> to go into that post and 
            //detele the comment from the comments array of the post

            let postId = comment.post;
            comment.remove();
            let post = Post.findByIdAndUpdate(postId, { $pull: {comments: req.params.id } });

            await Like.deleteMany({likeable: comment._id, onModel: 'comment'});

            if(req.xhr) {
                setTimeout(function() {
                    return res.status(200).json({
                        data: {
                            comment_id: req.params.id
                        },
                        message: "Comment deleted"
                    });
                }, T+80);
            }

        } else {
            return res.redirect('back');
        }
    } catch(err) {
        console.log("Err ",err);
    }
}