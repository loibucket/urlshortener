"user strict";

var express = require('express');
var app = express();

// set port
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
  res.render('index');
});

app.listen(port, function () {
  console.log('Example app listening on port '+port);
})