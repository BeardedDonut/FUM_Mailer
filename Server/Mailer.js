/**
 * Created by navid on 3/18/17.
 */
'use strict';
const nodemailer = require('nodemailer');

//transporter object which will send emails
var transporter = nodemailer.createTransport({
    //TODO : Create a gmail account for mailing purpose
    service: 'gmail',
    auth: {
        user: 'prograph@gmail.com',
        pass: 'what do you think?'
    }
});

//send confirmation code to the user email
var send_confirmation_code = function (data, callback) {
    var emailTest = "Hello Dear " + data["username"] + ".We have received your request for signing up to our application." +
            "Please confirm your request by sending us back the confirmation number in below. \n ";
    var clientEmail = data["email"];

    var mailOption = {
        from: 'prograph@gmail.com',
        to: clientEmail,
        subject: 'Confirmation',
        text: emailTest,
        html: '<b style="float = right">{}</b>'.format(data["confirmation_code"])
    };

    transporter.sendMail(mailOption, function (error, info) {
        if (error)
            callback(error, null);
        else
            callback(null, info);
    });


};



exports.SendAuthenticationMail = SendAuthenticationMail;