const nodeMailer = require('../config/nodemailer');
const User = require('../models/user');

//create a function that will send the emails now

// module.exports.newComment = function(a, b, c)
// or simple do -> this is another way of exporting a method
exports.newToken = (resetPasswordToken) => {
    console.log('inside forgot password mailer ', resetPasswordToken);
    //send an email

    let htmlString = nodeMailer.renderTemplate({
        token: resetPasswordToken
    }, '/users/reset_password_form.ejs');

    User.findById(resetPasswordToken.user, function(err, user) {
        console.log(user.email);
        nodeMailer.transporter.sendMail({
            from: 'Codeial',
            to: user.email,
            subject: 'Reset password | Codeial',
            html: htmlString
        }, (err, info) => {
            if(err) {
                console.log("Error in sending mail ", err);
                return;
            }
            console.log("EMAIL SENT ", info);
            return;
        });
    });
}


