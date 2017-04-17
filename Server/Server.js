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

//this function sends the confirmation code to a user provided his username
function send_confirmation_code(userdata, callback) {
    console.log(chalk.yellow("Server:send-confirm >>> ") + chalk.white("sending confirmation code"));

    //fetch the user data
    DBMiddleware.fetch_user_prime_data(userdata, function (error, result) {

        //check there is no problem with fetching
        if (error == null) {
            if (result == null)
                callback(new Error("Not Found"), null);
            else {

                //generate a code
                code_generator.generate_short_id(function (code) {

                    result.confirmation_code = code;
                    //set the generated confirm code in database too
                    DBMiddleware.set_confirm_code(result, function (my_error, my_result) {});

                    //ask mailer module to send the generated confirmation code
                    Mailer.send_confirmation_code(result, function (error, info) {

                        //check if there is any error with mailing
                        if (error == null)
                            callback(null, info);//if there is no problem with mailing , call callback with additional info
                        else
                            callback(error);//if there was a problem , call callback with error
                    });
                })
            }
        } else {
            //if fetching has a problem
            callback(new Error(error.toString()), null);
        }

    });
}

//check server
app.get("/", function (req, res) {
    console.log(chalk.yellow("Server:get >>> ") + chalk.white("checking for server status"));
    res.send("Server is up and running ... please enter your name");
});

//user registration api
app.post("/user/", function (req, res) {
    console.log(chalk.yellow("Server:user-post >>> ") + chalk.white("registering a user"));

    //register in database
    DBMiddleware.register_user(req.body);

    //send the confirmation code to registered-user's email
    send_confirmation_code(req.body, function (error, info) {
        if (error)
            res.send(error.toString());
        else
            res.send(info);
    });


});

//getting user full info api
app.get("/user/:id", function (req, res) {
    console.log(chalk.yellow("Server:user-get >>> ") + chalk.white("someone tries to log in"));
    data = DBMiddleware.fetch_user_prime_data({"username": req.params.id}, function (error, result) {
        console.log("DATA IS \n" + result);
        res.send(result)
    });
});

//user authentication api
app.put("/user/", function (req, res) {
    console.log(chalk.yellow("Server:user-put >>> ") + chalk.white("checking log in info"));

    //scrap content from request
    password = req.body.password;
    username = req.body.username;

    //forge reply
    reply = {"status": 0, "content": null};

    //ask the db middleware to check for correctness
    userdata = DBMiddleware.check_user_password({
        "username": username,
        "password": password
    }, function (error, results) {
        if (error)
            reply.content = error.toString();
        else if (results == true) {
            reply.status = 1;
            reply.content = "Welcome";
        }
        else
            reply.content = "username or password incorrect.Try again";

        //send the reply
        res.send(reply);
    });

});

//check if a given confirmation code matches
app.put("/confirmation/", function (req, res) {
    console.log(chalk.yellow("Server:confirmation-put >>> ") + chalk.white("checking if conf codes match?"));

    //scrap given confirmation code from request
    confirmation_code = req.body.confirmation_code;
    username = req.body.username;


    //forge reply template
    reply = {"status": 0, "content": null};

    //check if user have given a confirmation code and a username pr not
    if (confirmation_code == null || username == null) {
        reply.content = "no confirmation or username specified";
        res.send(reply);
    } else {  //if there is a confirmation code in request

        //ask db to get the confirmation code
        DBMiddleware.fetch_confirm_code(req.body, function (error, result) {
            if (error == null) {
                fetched_conf_code = result.confirm_code;

                //check if they are equal or not
                if (fetched_conf_code == confirmation_code) {
                    DBMiddleware.set_confirm_code_status(req.body, 1, function (error, info) {
                        if (error)
                            res.send(reply.content = error.toString());
                        else {
                            reply.status = 1;
                            reply.content = "confirm code matches";
                            res.send(reply);
                        }
                    });
                } else {
                    reply.content = "confirmation code mismatches or user does not exit!";
                    res.send(reply);
                }
            }
            else res.send(reply.content = error.toString());
        });

    }


});

//resending confirmation code to an specific username
app.post("/confirmation/", function (req, res) {
    console.log(chalk.yellow("Server:confirmation-post >>> ") + chalk.white("asking for resending confirmation code"));

    //scrap username from req body
    username = req.body.username;

    //forge a proper reply template
    reply = {"status": 0, "content": null};

    //check for the request body content is as required
    if (username == null) {
        {
            reply.content = "no username specified";
            res.send(reply);
        }
    } else {
        //send conf code
        send_confirmation_code(req.body, function (error, info) {
            if (error)
                res.send(reply.content = error.toString());
            else {
                reply.status = 1;
                reply.content = "confirmation code sent";
                res.send(reply);
            }
        });
    }


});

var server = app.listen(port, address, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Server is listening at http://%s:%s", host, port);
});


var connectedUsers = [];
