const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
        type: String, 
        required: true
    },
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    to_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;