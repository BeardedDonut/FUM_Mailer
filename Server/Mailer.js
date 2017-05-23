/**
 * Created by navid on 3/18/17.
 */
'use strict';
const nodemailer = require('nodemailer');
var chalk = require("chalk");
var ejs = require("ejs");
var fs = require('fs');

var transporter;
var email = "";
var password = "";

init(function (err) {
    if (err)
        throw  err;
    transporter = nodemailer.createTransport({
        //TODO : read it from a file ; hardcoding authentication information is not the best practice
        service: 'gmail',
        auth: {
            email: email,
            password: password
        }
    });
});


function init(callback) {
    console.log("init");
    fs.readFile(__dirname + "/config.json", function (err, data) {
        if (err) {
            callback(err, null);
        }
        else {
            var parsedJson = JSON.parse(data);
            email = parsedJson.Email.email;
            password = parsedJson.Email.password;
        }
    });
}

//send confirmation code to the user email
function send_confirmation_code(userdata, callback) {
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