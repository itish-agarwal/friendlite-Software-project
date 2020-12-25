const nodeMailer = require('../config/nodemailer');

//create a function that will send the emails now

// module.exports.newComment = function(a, b, c)
// or simple do -> this is another way of exporting a method
exports.registrationSuccessful = (user) => {
    console.log('inside new user mailer ', user);
    //send an email

    let htmlString = nodeMailer.renderTemplate({
        user: user
    }, '/users/registration_successful.ejs');
    
    nodeMailer.transporter.sendMail({
        from: 'Codeial',
        to: user.email,
        subject: 'Registration successful',
        html: htmlString
    }, (err, info) => {
        if(err) {
            console.log("Error in sending mail ", err);
            return;
        }
        console.log("EMAIL SENT ", info);
        return;
    });
}


