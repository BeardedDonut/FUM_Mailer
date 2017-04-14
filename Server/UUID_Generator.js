var shortid = require("shortid");
var chalk = require("chalk");

console.log(shortid.generate().length);

//id generator
var generate_short_id = function (callback){
    var my_id = shortid.generate();
    console.log(chalk.yellow("UUID_GEN >>> ") + chalk.blue("uuid generated -> " + my_id));
    if(my_id.length > 8) my_id = my_id.substring(0,8) ;
    callback(my_id);
};


exports.generate_short_id  = generate_short_id ;

