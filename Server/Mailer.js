/**
 * Created by navid on 3/18/17.
 */
'use strict';
const nodemailer = require('nodemailer');



//transporter object which will send emails
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'koopernikkoop@gmail.com',
        pass: '19961375nA'
    }
});










var SendAuthenticationMail = function (data, callback) {
    var emailTest = "Hello Dear " + data["name"] + ".We received your request for signing up to our application." +
            "Please confirm your request by sending us back the confirmation number in below. \n " + data["confirmation"]
        ;
    var clientEmail = data["email"];

    var mailOption = {
        from: 'koopernikkoop@gmail.com',
        to: clientEmail,
        subject: 'Confirmation',
        text: emailTest,
        html: '<b style="float = right"> Best _ Koopernik Koop </b>'
    };

    transporter.sendMail(mailOption, function (error, info) {
        if (error)
            callback(error, null);
        else
            callback(null, info);
    });
};



exports.SendAuthenticationMail = SendAuthenticationMail;