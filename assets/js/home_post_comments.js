// Let's implement this via classes

// this class would be initialized for every post on the page
// 1. When the page loads
// 2. Creation of every post dynamically via AJAX

class PostComments{
    // constructor is used to initialize the instance of the class whenever a new instance is created
    constructor(postId){
        this.postId = postId;
        this.postContainer = $(`#post-${postId}`);
        this.newCommentForm = $(`#post-${postId}-comments-form`);
        

        this.createComment(postId);

        let self = this;
        // call for all the existing comments
        $(' .delete-comment-button', this.postContainer).each(function(){
            self.deleteComment($(this));
        });
    }


    createComment(postId){
        let pSelf = this;
        this.newCommentForm.submit(function(e){
            e.preventDefault();
            let self = this;

            $.ajax({
                type: 'post',
                url: '/comments/create',
                data: $(self).serialize(),
                success: function(data){
                    let newComment = pSelf.newCommentDom(data.data.comment);
                    $(`#post-comments-${postId}`).prepend(newComment);
                    pSelf.deleteComment($(' .delete-comment-button', newComment));

                    new ToggleLike($(' .toggle-like-button', newComment));

                    new Noty({
                        theme: 'relax',
                        text: "Comment published!",
                        type: 'success',
                        layout: 'bottomRight',
                        timeout: 400
                        
                    }).show();

                }, error: function(error){
                    console.log(error.responseText);
                }
            });


        });
    };

    newCommentDom(comment) {
        return $(`<li id="comment-${comment._id}">
                    <p style="max-width: 17.6rem; word-break:break-all; padding-bottom: 5px; border-bottom: 1px solid rgb(250, 247, 247);">
                        ${ comment.content }
                        <br>
                        <small>By</small>
                        <small style="display:inline-block; margin-bottom:0.3rem; font-weight: bold;">
                            ${ comment.user.name }
                        </small>

                        <br>
                        <small>
                            <a class="delete-comment-button" href="/comments/destroy/${comment._id}">
                                Delete 
                            </a>
                        </small>
                        <br>
                        <small>
                            <a style="text-decoration: none;" class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${comment._id}&type=Comment">
                                <i class="fas fa-thumbs-up"> </i> 0 
                            </a>
                        </small>
                    </p>
                </li>`);
    }

    deleteComment(deleteLink){
        $(deleteLink).click(function(e){
            e.preventDefault();

            $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'),
                success: function(data){
                    $(`#comment-${data.data.comment_id}`).remove();

                    new Noty({
                        theme: 'relax',
                        text: "Deleted comment",
                        type: 'success',
                        layout: 'bottomRight',
                        timeout: 400
                        
                    }).show();
                },error: function(error){
                    console.log(error.responseText);
                }
            });

        });
    }
}