/**
 * Created by navid on 3/18/17.
 */
'use strict';
const nodemailer = require('nodemailer');
var chalk = require("chalk");
var ejs = require("ejs");

//transporter object which will send emails
var transporter = nodemailer.createTransport({
    //TODO : Create a gmail account for mailing purpose
    service: 'gmail',
    auth: {
        user: '<email>',
        pass: '<password>'
    }
});

//send confirmation code to the user email
var send_confirmation_code = function (userdata, callback) {
    console.log(chalk.yellow("Mailer:send-confirm-code >>> ") + chalk.white("sending sending email"));
    var emailTest = "Hello Dear " + userdata["username"] + ".We have received your request for signing up to our application." +
        "Please confirm your request by sending us back the confirmation number in below. \n ";
    var clientEmail = userdata["email"];

    ejs.renderFile(__dirname + "/views/confirm_mail.ejs", userdata, function (err, str) {
        if (err)
            console.log(err.toString());
        else {

            var mailOption = {
                from: 'bishoorozgal@gmail.com',
                to: clientEmail,
                subject: 'Confirmation',
                text: emailTest,
                html: str
            };
        }

        transporter.sendMail(mailOption, function (error, info) {
            if (error)
                callback(error, null);
            else
                callback(null, info);
        });


    });

};


exports.send_confirmation_code = send_confirmation_code;