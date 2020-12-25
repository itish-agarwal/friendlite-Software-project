const Message = require('../models/message');

module.exports.chatSockets = function(socketServer){
    let io = require('socket.io')(socketServer, {
        cors: {
            origin: '*',
        }
    });

    io.sockets.on('connection', function(socket){
        console.log('new connection received', socket.id);

        socket.on('disconnect', function(){
            console.log('socket disconnected!');
        });

        
        socket.on('join_room', function(data){
            // console.log('joining request rec.', data);
            socket.join(data.chatroom);
            io.in(data.chatroom).emit('user_joined', data);
        });

        // CHANGE :: detect send_message and broadcast to everyone in the room
        socket.on('send_message', function(data){            

            // create a new message here

            let from_user_id = data.from_user_id;
            let to_user_id = data.to_user_id;
            let messageId = 'fo';

            let message =Message.create({
                content: data.message,
                from_user: from_user_id,
                to_user: to_user_id,
                createdAt: Date().toString()
            }, function(err, message) {
                if(err) {
                    console.log("Error in chat_sockets.js->message.create", err);
                    return;
                }
                messageId = message.id;
                data.messageId = message.id;
                io.in(data.chatroom).emit('receive_message', data);
            });
        });
    });
}
