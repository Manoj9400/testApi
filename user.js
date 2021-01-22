var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var user = new Schema({
            name:{
                type:String,
                required:"Enter Name"
            },
            email:{
                 type:String,
                 required:true
            },
            password:{
                type:String,
                required:true  
            }
});

module.exports = mongoose.model("user", user);