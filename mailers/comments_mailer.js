const nodeMailer = require('../config/nodemailer');

//create a function that will send the emails now

// module.exports.newComment = function(a, b, c)
// or simple do -> this is another way of exporting a method
exports.newComment = (comment) => {
    console.log('inside new comment mailer ', comment);
    //send an email

    let htmlString = nodeMailer.renderTemplate({
        comment: comment
    }, '/comments/new_comment.ejs');
    
    nodeMailer.transporter.sendMail({
        from: 'Codeial',
        to: comment.user.email,
        subject: 'New comment published',
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


