/**
 * Created by navid on 2/28/17.
 */
//REQUIREMENTS -->
var express         = require("express");
var bodyParser      = require('body-parser');
var multer          = require('multer'); // v1.0.5
var chalk           = require('chalk');
var DBMiddleware    = require("./Database_Middleware.js");
var upload          = multer(); // for parsing multipart/form-data
var app             = express();
var http            = require("http");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//INIT -->
DBMiddleware.connect();
var address = "localhost" ;
var port = 3000;

//check server
app.get("/" , function(req,res){
    console.log("somebody has connected to us");+
    res.send("Server is up and running ... please enter your name");
});

//user registration api
app.post("/user/" , function (req,res) {
    console.log("someone wants to register to the server");
    console.log(req.body);
    //TODO : confirmation code has to be sent
    DBMiddleware.register_user(req.body);
    res.send("HAHAHAHA");
});

//getting user full info api
app.get("/user/:id" , function (req,res) {
    console.log("someone wants Client information from the server");
    console.log("Params" + req.params.id);
    data = DBMiddleware.fetch_user_prime_data({"username" : req.params.id }, function (error , result) {
        console.log("DATA IS \n" + result);
        res.send(result)
    });
});

//user authentication api
app.put("/user/" , function(req ,res){
    console.log(chalk.yellow("Server:user-put >>> ") + chalk.white("checking log in info"));

    //scap content from request
    password = req.body.password ;
    username = req.body.username;

    console.log(chalk.green("Server:user-put >>> ") + chalk.blue(  "given username " + username +
                                                                    " given password " + password));

    //forge reply
    reply = { "status" : 0 , "content" : null };

    //ask the db middleware to check for correctness
    userdata = DBMiddleware.check_user_password({"username" : username ,
                                                "password" : password} , function (error , results) {
        if(error) {
            console.log(chalk.green("Server:user-put >>> ") + chalk.blue(error.toString()));
            reply.status = 0;
            reply.content = error.toString();
        }
        else if(results == true){
            console.log(chalk.green("Server:user-put >>> ") + chalk.blue("Passwords matches.Welcome"));
            reply.status = 1 ;
            reply.content = "Welcome";
        }
        else {
            console.log(chalk.green("Server:user-put >>> ") + chalk.blue("username or password incorrect "));
            reply.status = 0 ;
            reply.content = "username or password incorrect.Try again" ;
        }
        //send the reply
        res.send(reply);
    });

});


var server = app.listen(port, address , function(){
    var host = server.address().address ;
    var port = server.address().port ;

    console.log("Server is listening at http://%s:%s" , host ,port);
});



var connectedUsers = [] ;
