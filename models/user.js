const mongoose = require('mongoose');

//import multer now
const multer = require('multer');
const path = require('path');

const AVATAR_PATH = path.join('/uploads/users/avatars');    

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    friendships: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Friendship'
        }
    ]
}, {
    timestamps: true
});


let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //cb is the callback function
      cb(null, path.join(__dirname, '..', AVATAR_PATH));
    },

    //file.fieldname -> 'avatar'; so each file will be stored as 'avatar-date.now()'
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now());
    }
});

//define static functions

userSchema.statics.uploadedAvatar = multer({storage: storage}).single('avatar');
//.single('avatar') says that only one file will be uploaded for the field avatar


userSchema.statics.avatarPath = AVATAR_PATH;


const User = mongoose.model('User', userSchema);

module.exports = User;

