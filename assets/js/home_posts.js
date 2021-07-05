{   
    //method to submit the form data for new post using AJAX
  
    let createPost = function() {
        //get post form via id
        let newPostForm = $('#new-post-form');
        //we do not want this form to be submitted naturally
        newPostForm.submit(function(e) {
            e.preventDefault();

            $.ajax({
                type: 'post',
                url: '/posts/create',
                //send in data now
                data: newPostForm.serialize(), //converts post form data into json
                success: function(data) {

                    let newPost = newPostDom(data.data.post);
                    $('#posts-list-container>ul').prepend(newPost);

                   
                    deletePost($(' .delete-post-button', newPost));
                    new PostComments(data.data.post._id);

                    new ToggleLike($(' .toggle-like-button', newPost));

                    // deletePost($(' .delete-post-button', newPost));                   

                    new Noty({
                        theme: 'relax',
                        text: 'Posted',
                        type: 'success',
                        layout: 'bottomRight',
                        timeout: 400
                    }).show();

                },  
                error: function(err) {
                    console.log(err.responseText);
                }
            });
        });
    }

    //method to create a post in DOM
    //convert html text into jquery

    let newPostDom = function(post) {
        return $(`<li id="post-${post._id}">
                    <p>                       
                        ${ post.content }
                        <br>
                        <small> By </small>
                        <small style="display: inline-block; font-weight: bold;">
                            ${ post.user.name }
                        </small>
                        <br>
                        <small>
                            <a class="delete-post-button" href="/posts/destroy/${post._id}">
                                Remove <i class="fas fa-times-circle"></i>
                            </a>
                        </small>

                        <br>
                        <small>
                            <a style="text-decoration: none; font-size:0.94rem;" class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${post._id}&type=Post">
                                <i class="fas fa-thumbs-up"> </i> 0
                            </a>
                        </small>
                    </p>
                
                    <div class="post-comments">
                
                        <form id="post-${post._id}-comments-form" action="/comments/create" method="POST">
            
                            <input class="comment-input" type="text" name="content" placeholder="Comment....." required>
                            <!-- now we also need to send the id of the post to which this comment needs to be added
                            -->
            
                            <input type="hidden" name="post" value="${ post._id }">
                            <input id="commentBtn" type="submit" value="Add">
            
                        </form>
                
                        <div class="post-comments-list" style="width:21rem; border-right: 1px solid rgb(250, 247, 247);">
                            <ul id = "post-comments-${post._id}">
                         
                            </ul>
                        </div>
                    </div>                    
                </li>`);
    }

   // method to delete a post from DOM
    let deletePost = function(deleteLink){
        $(deleteLink).click(function(e){
            e.preventDefault();

            $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'),
                success: function(data){
                    $(`#post-${data.data.post_id}`).remove();
                    
                    new Noty({
                        theme: 'relax',
                        text: 'Post deleted',
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

    let convertPostsToAjax = function() {
        $('#posts-list-container>ul>li').each(function() {
            let self = $(this);
            let deleteButton = $(' .delete-post-button', self);
            deletePost(deleteButton); 
            
            let postId = self.prop('id').split("-")[1];
            new PostComments(postId);

        });
    }


    let createdPostFlash = async function() {
        new Noty({
            theme: 'relax',
            text: 'Posted',
            type: 'success',
            layout: 'topRight',
            timeout: 400
        }).show();
    }

    let deletedPostFlash = async function() {
        new Noty({
            theme: 'relax',
            text: 'Deleted post',
            type: 'success',
            layout: 'topRight',
            timeout: 400
        }).show();
    }

    createPost();
    convertPostsToAjax();
}