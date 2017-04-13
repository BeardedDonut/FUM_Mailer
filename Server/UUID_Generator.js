var shortid = require("shortid");
var chalk = require("chalk");

console.log(shortid.generate().length);

//id generator
var generate_short_id = function (){
    var my_id = shortid.generate();
    console.log(chalk.yellow("UUID_GEN >>> ") + chalk.blue("uuid generated -> " + my_id));
    return my_id ;
};


exports.generate_short_id  = generate_short_id ;

