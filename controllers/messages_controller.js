const Message = require('../models/message');

module.exports.destroy = async function(req, res) {
    let messageId = req.params.id;
    
    let message = await Message.findById(messageId);
    
    message.remove();

    return res.redirect('back');
}