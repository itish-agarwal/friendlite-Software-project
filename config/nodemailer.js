const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path');
const env = require('./environment');

//define our transporter -> which will be attached with nodemailer  
let transporter = nodemailer.createTransport(env.smtp);

//define that we will be using ejs
let renderTemplate = (data, relativePath) => {
    //define a variable in which we will be storing all the html that is going to be sent in that email
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname, '../views/mailers', relativePath),
        data, /*data which we pass to ejs*/
        function(err, template) {
            if(err) {
                console.log("Error in rendering template in email ", err);
                return;
            }
            mailHTML = template;
        }
    )
    return mailHTML;
}

module.exports = {
    transporter: transporter,
    renderTemplate: renderTemplate
}