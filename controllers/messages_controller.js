const Message = require('../models/message');

module.exports.destroy = async function(req, res) {
    let messageId = req.params.id;
    
    let message = await Message.findById(messageId);
    
    message.remove();

    return res.redirect('back');
}

module.exports.destroyAll = async function(req, res) {
    let userA = req.query.from_user;
    let userB = req.query.to_user;
    
    let messages = await Message.find({});
    
    for(message of messages) {        
        if(message.from_user==userA && message.to_user==userB) {
            message.remove();
        } else if(message.from_user==userB && message.to_user==userA) {
            message.remove();
        }
    }
    return res.redirect('back');
}