"user strict";

require('dotenv').config();

var express = require('express');
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = process.env.MONGOLAB_URI; 
console.log(url);

// set port
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
  res.render('index');
});

app.listen(port, function () {
  console.log('Example app listening on port '+port);
})

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established');

    // do some work here with the database.

    //Close connection
    db.close();
  }
});

