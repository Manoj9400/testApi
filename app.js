var mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var port = 3050;
var userController = require('./controllers/userController');
app.use('/api/controllers', userController);
let user = require("./model/user");

const router = express.Router();
require('dotenv').config()

app.use(bodyParser.json());
//console.log(bodyParser)

app.use(express.json())
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));
var uri = process.env.MONGOURI;

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function() {
  //console.log("MongoDB database connection established successfully");
});

app.listen(port, function(){
 //console.log("port is ready" +port)
});