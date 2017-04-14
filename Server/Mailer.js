/**
 * Created by navid on 3/18/17.
 */
'use strict';
const nodemailer = require('nodemailer');
var chalk = require("chalk");

//transporter object which will send emails
var transporter = nodemailer.createTransport({
    //TODO : Create a gmail account for mailing purpose
    service: 'gmail',
    auth: {
        user: 'bishoorozgal@gmail.com',
        pass: '1234567*('
    }
});

//send confirmation code to the user email
var send_confirmation_code = function (userdata, callback) {
    console.log(chalk.yellow("Mailer:send-confirm-code >>> ") + chalk.white("sending sending email"));
    var emailTest = "Hello Dear " + userdata["username"] + ".We have received your request for signing up to our application." +
            "Please confirm your request by sending us back the confirmation number in below. \n ";
    var clientEmail = userdata["email"];

    var mailOption = {
        from: 'bishoorozgal@gmail.com',
        to: clientEmail,
        subject: 'Confirmation',
        text: emailTest,
        html: '<b style="float = right">{}</b>'.format(userdata["confirmation_code"])
    };

    console.log(chalk.yellow("Mailer:send-confirm-code >>> ") + chalk.blue(JSON.stringify(mailOption)));
    //callback(null , "ok");


    transporter.sendMail(mailOption, function (error, info) {
        if (error)
            callback(error, null);
        else
            callback(null, info);
    });


};



exports.send_confirmation_code = send_confirmation_code;