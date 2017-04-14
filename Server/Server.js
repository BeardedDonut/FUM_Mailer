/**
 * Created by navid on 2/28/17.
 */
//REQUIREMENTS -->
var express = require("express");
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var chalk = require('chalk');
var DBMiddleware = require("./Database_Middleware.js");
var Mailer = require("./Mailer");
var code_generator = require("./UUID_Generator");
var upload = multer(); // for parsing multipart/form-data
var app = express();
var http = require("http");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

//INIT -->
DBMiddleware.connect();
var address = "localhost";
var port = 3000;

function send_confirmation_code(userdata, callback) {
    console.log(chalk.yellow("Server:send-confirm >>> ") + chalk.white("sending confirmation code"));
    //fetch the user data
    DBMiddleware.fetch_user_prime_data(userdata, function (error, result) {
        //check there is no problem with fetching
        if (error == null) {
            console.log(chalk.yellow("Server:send-confirm >>> ") + chalk.blue("DATA -> \n" + JSON.stringify(result)));

            //generate a code
            code_generator.generate_short_id(function (code) {
                result.confirmation_code = code ;
                //set the generated confirm code in database too
                DBMiddleware.set_confirm_code(result , function (my_error , my_result) {
                    console.log(chalk.yellow("Server:send-confirm >>> ") + chalk.blue("set conf in db -> \n" + JSON.stringify(my_result)));
                });

                console.log(chalk.yellow("Server:send-confirm >>> ") + chalk.blue("confirm code : " + result.confirmation_code));
                //ask mailer module to send the generated confirmation code
                Mailer.send_confirmation_code(result, function (error, info) {
                    //check if there is any error with mailing
                    if (error == null) {
                        //if there is no problem with mailing , call callback with additional info
                        console.log(chalk.yellow("Server:send-confirm >>> ") + chalk.blue("Sent info :" + info));
                        callback(null, info);
                    }
                    else {
                        //if there was a problem , call callback with error
                        console.log(chalk.yellow("Server:send-confirm >>> ") + chalk.blue(error.toString()));
                        callback(error);
                    }
                });
            })
        } else {
            //if fetching has a problem
            console.log(chalk.yellow("Server:send-confirm >>> ") + chalk.blue(error.toString()));
            callback(new Error(error.toString()), null);
        }

    });
}

//check server
app.get("/", function (req, res) {
    console.log("somebody has connected to us");
    +
        res.send("Server is up and running ... please enter your name");
});

//user registration api
app.post("/user/", function (req, res) {
    console.log(chalk.yellow("Server:user-post >>> ") + chalk.white("registering a user"));
    DBMiddleware.register_user(req.body);

    //TODO : confirmation code has to be sent
    send_confirmation_code(req.body, function (error, info) {
        if (error)
            res.send(error.toString());
        else
            res.send(info);
    });


});

//getting user full info api
app.get("/user/:id", function (req, res) {
    console.log("someone wants Client information from the server");
    console.log("Params" + req.params.id);
    data = DBMiddleware.fetch_user_prime_data({"username": req.params.id}, function (error, result) {
        console.log("DATA IS \n" + result);
        res.send(result)
    });
});

//user authentication api
app.put("/user/", function (req, res) {
    console.log(chalk.yellow("Server:user-put >>> ") + chalk.white("checking log in info"));

    //scap content from request
    password = req.body.password;
    username = req.body.username;

    console.log(chalk.green("Server:user-put >>> ") + chalk.blue("given username " + username +
            " given password " + password));

    //forge reply
    reply = {"status": 0, "content": null};

    //ask the db middleware to check for correctness
    userdata = DBMiddleware.check_user_password({
        "username": username,
        "password": password
    }, function (error, results) {
        if (error) {
            console.log(chalk.green("Server:user-put >>> ") + chalk.blue(error.toString()));
            reply.status = 0;
            reply.content = error.toString();
        }
        else if (results == true) {
            console.log(chalk.green("Server:user-put >>> ") + chalk.blue("Passwords matches.Welcome"));
            reply.status = 1;
            reply.content = "Welcome";
        }
        else {
            console.log(chalk.green("Server:user-put >>> ") + chalk.blue("username or password incorrect "));
            reply.status = 0;
            reply.content = "username or password incorrect.Try again";
        }
        //send the reply
        res.send(reply);
    });

});


var server = app.listen(port, address, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Server is listening at http://%s:%s", host, port);
});


var connectedUsers = [];
