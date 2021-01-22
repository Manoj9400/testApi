var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var product = new Schema({
            userid:{
                type: mongoose.Schema.ObjectId, ref:'user'
            },
            name:{
                type:String
            },
            quantity:{
                type:Number
            },
            image:{
                type:String
            }
});

module.exports = mongoose.model("product", product);