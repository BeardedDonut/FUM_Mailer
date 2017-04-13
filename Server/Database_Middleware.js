var database_middleware;
var mysql      = require('mysql');
var chalk      = require('chalk');
//mysql agent
//TODO : create privileged user on database side
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'mail_tester',
  password : '12341234',
  database : 'FUM_Mailer'
});

//string replace util
String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};


//database_middleware.connect
var connect = function () {
  console.log(chalk.blue("Attempting to connect to the database ..."));
  connection.connect();
  console.log(chalk.blue("Connected!"));
};

//runs a query on database
var run_query = function(query) {
  connection.query(query , function (error , results , fields) {
    if(error) throw error ;
    else{
      console.log("query is done!");
      return results;
    }
  })
};

//register a user with given user data
function register_user(userdata){
    console.log(chalk.red("###--- REGISTER USER ---###"));

    var query2 ="CALL register_user('" +
        userdata["username"] + "','"+
        userdata["email"]+"','" +
        userdata["first_name"] + "','" +
        userdata["last_name"]+"','"+
        userdata["password"]+"');";

    connection.query(query2);
    console.log(chalk.green("$$$--USER ADD---$$$ \n" )+ query2);

}

//fetch user data
function fetch_user_prime_data(userdata , callback) {
    var query=  "SELECT username , first_name , last_name , email " +
                "FROM user " +
                "WHERE username= '" +userdata["username"]+ "';";

    console.log(chalk.red("###--- FETCHING DATA ---###\n") +query );

    connection.query(query , function (errors , results , fields) {
        if(errors)
            callback(errors , null);    //if there was an internal error of Mariadb throw it
        else if(!results)
            callback(new Error("NOT FOUND") , null);    //if there is no result
        else{
            //else if everything is all right send back the results
            console.log(chalk.green("$$$--USER PRIMARY FETCH---$$$ \n" ) + JSON.stringify(results[0]));
            callback(null , JSON.stringify(results[0]));
        }
    });
}

//fetch inbox
function fetch_user_inbox(userdata , callback){
    var query = "SELECT * FROM message , send_message WHERE receiver_username = "+userdata["username"] +" AND id = message_id ";
    console.log(chalk.red("###--- Fetching inbox ---###")) ;
    connection.query(query , function(errors , results , fields){
        if(errors)
            callback(error , null );
        else if(!results)
            callback(new Error("NOT FOUND") , null) ;
        else {
            console.log(chalk.green("$$$--- All mails received ---$$$") + JSON.stringify(results[0]));
            callback(null , JSON.stringify(results));
        }
    });
}

//fetch sent mails
function fetch_user_sent(userdata , callback){
    var query = "SELECT * FROM message , send_message WHERE sender_username = "+userdata["username"] +" AND id = message_id ";
    console.log(chalk.red("###--- Fetching sent box ---###")) ;
    connection.query(query , function(errors , results , fields){
        if(errors)
            callback(error , null );
        else if(!results)
            callback(new Error("NOT FOUND") , null) ;
        else {
            console.log(chalk.green("$$$--- All sent messages ---$$$") + JSON.stringify(results[0]));
            callback(null , JSON.stringify(results));
        }
    });
}


function check_user_password(userdata , callback){
    console.log(chalk.yellow("DB_Middleware >>> ") + chalk.white("checking password" ));
    console.log(chalk.green("DB_Middleware:check-user-password >>> ")+chalk.blue("given password"+userdata["password"]));

    //forge a proper query
    var query= "SELECT password , is_confirmed FROM user WHERE username= '"+userdata["username"]+"'" ;
    console.log(chalk.green("DB_Middleware:check-user-password >>> ")+chalk.blue("query :"+query));

    //run the query
    connection.query(query , function(error , results , fields){
        if(error)
            callback(error , null) ;
        else if(!results)
            callback(new Error("NOT FOUND") , null);
        else {
            fetched_info = results[0];
            console.log(chalk.green("DB_Middleware >>> ")+ chalk.blue("fetched password: "+JSON.stringify(fetched_info)));
            if(fetched_info["is_confirmed"] == 0)
                callback(new Error("Not Confirmed") , null);
            else
                callback(null , fetched_info == userdata["password"]);
        }
    });
}

exports.connect = connect;
exports.run_query = run_query;
exports.register_user = register_user;
exports.fetch_user_prime_data = fetch_user_prime_data;
exports.fetch_user_inbox = fetch_user_inbox ;
exports.fetch_user_sent = fetch_user_sent ;
exports.check_user_password = check_user_password;


//TEST --
function test(){
    console.log(chalk.yellow("1- connecting..."));
    connect();

    console.log(chalk.yellow("2- fetch Navid9675 user data..."));
    fetch_user_prime_data({"username":"Navid9675"} , function(error , result){});

    console.log("3- register new user shalgham1234");
    //register_user({"username":"shalgham1234" , "email" : "shalghamkhan@gmail.com" , ""})

}




//END TEST

/**
 * Created by navid on 3/2/17.
 */
