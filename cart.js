var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var cart = new Schema({
            userid:{
                type: mongoose.Schema.ObjectId, ref:'user'
            },
            productid:{
                type: mongoose.Schema.ObjectId, ref:'product'
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

module.exports = mongoose.model("cart", cart);