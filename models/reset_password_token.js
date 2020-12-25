const mongoose = require('mongoose');
const { resetPassword } = require('../controllers/users_controller');


const resetPasswordTokenSchema = new mongoose.Schema({
    user: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // include the array of ids of all comments in this post schema itself
    accessToken: {
        type: String, 
        required: true
    }, 
    isValid: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


const resetPasswordToken = mongoose.model('resetPasswordToken', resetPasswordTokenSchema);

module.exports = resetPasswordToken;