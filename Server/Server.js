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
var address = "192.168.43.201" ;
var port = 3003;

app.get("/" , function(req,res){
    console.log("somebody has connected to us");+
    res.send("Server is up and running ... please enter your name");
});

app.post("/user/" , function (req,res) {
    console.log("someone wants to register to the server");
    console.log(req.body);
    //TODO : confirmation code has to be sent
    DBMiddleware.register_user(req.body);
    res.send("HAHAHAHA");
});

app.get("/user/:id" , function (req,res) {
    console.log("someone wants Client information from the server");
    console.log("Params" + req.params.id);
    data = DBMiddleware.fetch_user_prime_data({"username" : req.params.id }, function (error , result) {
        console.log("DATA IS \n" + result);
        res.send(result)
    });
});

app.put("/user/" , function(req ,res){
    console.log(chalk.yellow("someone wants to login ..."));
    password = req.body.password ;
    username = req.body.username;
    console.log(chalk.blue("I GOT info \n password : "+ password +"\n username " + username ));
    //userdata = DBMiddleware.

});


var server = app.listen(port, address , function(){
    var host = server.address().address ;
    var port = server.address().port ;

    console.log("Server is listening at http://%s:%s" , host ,port);
});



var connectedUsers = [] ;
