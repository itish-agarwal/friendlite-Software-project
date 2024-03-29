
class ChatEngine{

    constructor(chatBoxId, userId, profileUserId){
        this.chatBox = $(`#${chatBoxId}`);
        this.userId = userId;
        this.profileUserId = profileUserId;


        this.socket = io.connect('http://localhost:5000');

        if (this.userId){
            this.connectionHandler();
        }
    }

    connectionHandler(){
        let self = this;

        this.socket.on('connect', function(){

            console.log('connection established using sockets...!');

            self.socket.emit('join_room', {
                from_user_id: self.userId,
                to_user_id: self.profileUserId,
                chatroom: 'codeial'
            });

            self.socket.on('user_joined', function(data){
                console.log('a user joined!', data);
            })

        });

        document.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
              // Cancel the default action, if needed
                event.preventDefault();
                let msg = $('#chat-message-input').val();
                $('#chat-message-input').val("");
                $('#chat-message-input').focus();
                let d = Date(Date.now());
                let time = d.toString();
                time = time.substr(0, 8) + time.substr(11, 10);
                console.log(time);
                if (msg != ''){
                    self.socket.emit('send_message', {
                        message: msg,
                        from_user_id: self.userId,
                        to_user_id: self.profileUserId,
                        messageId: '',
                        chatroom: 'codeial'
                    });
                }
            }
          });
        // CHANGE :: send a message on clicking the send message button
        $('#send-message').click(function(){
            let msg = $('#chat-message-input').val();
            $('#chat-message-input').val("");
            $('#chat-message-input').focus();
            if (msg != ''){
                self.socket.emit('send_message', {
                    message: msg,
                    from_user_id: self.userId,
                    to_user_id: self.profileUserId,
                    messageId: '',
                    chatroom: 'codeial'
                });
            }
        });

        self.socket.on('receive_message', function(data) {
            
            console.log('message received! ', data.message);


            let newMessage = $('<li>');
            let messageType = 'other-message';

            if(data.from_user_id == self.userId) {
                messageType = 'self-message';
            }

            newMessage.append($('<span>', {
                'html': data.message
            }));

            newMessage.addClass(messageType);

            if(messageType=='self-message') {
                newMessage.append($(`<a class="delete-message-button" href="/messages/destroy/${data.messageId}"> <i class="fas fa-trash"></i> </a>`));
            }

            $(`#chat-messages-list-${data.from_user_id}-${data.to_user_id}`).prepend(newMessage);
            
            $(`#chat-messages-list-${data.to_user_id}-${data.from_user_id}`).prepend(newMessage);

        });
    }
}
