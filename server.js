"user strict";

require('dotenv').config();

var express = require('express');
var app = express();
var mongoose = require('mongoose');

// Connection URL. This is where your mongodb server is running.
var url = process.env.MONGOLAB_URI; 

// set port
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
  res.render('index');
});

// Use connect method to connect to the Server
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var urlSchema = mongoose.Schema({
    original_url: String,
    short_url: String,
});

var urlModel = mongoose.model('url', urlSchema);

db.once('open', function() {
  // we're connected!
  saveOne();
  app.listen(port, function () {
    console.log('Example app listening on port '+port);
  });
});

app.get('/:id', function (req, res) {
  
  var fullUrl = req.protocol + '://' + req.get('host').split(':')[0] + req.originalUrl;

  urlModel.findOne({'short_url':fullUrl}, function(err, theOne){
    if (err) return console.error(err);
    
    if (theOne == null){
      res.send('url not found');
    } else {
      res.redirect(theOne.original_url);
    }
  });
  
});

app.get('/new/:id*', function (req, res) {
  
  //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  var hostUrl = req.protocol + '://' + req.get('host').split(':')[0] + '/';

  var urlString = req.params.id+req.param(0);
  
  if (!re_weburl.test(urlString)){
    
    var error = {};
    error.error = "Wrong url format, make sure you have a valid protocol and real site.";
    res.json(error);
    
  } else {
  
    handleUrlString(urlString, hostUrl, res);  
  
  }

});

function handleUrlString(urlString, hostUrl, res){
  
  urlModel.findOne({'original_url':urlString}, function(err, theOne){
    
    if (err) return console.error(err);
    
    if (theOne != null){
      
      var urlObject = theOne.toObject();
      delete urlObject['_id'];
      delete urlObject['__v'];
      res.json(urlObject);
      
    } else {
      
      urlModel.count({}, function( err, count){
      
      if (err) return console.error(err);

      var urlNum = (count+1).toString();
      
      var newUrl = new urlModel({ 
        original_url: urlString,
        short_url: hostUrl+urlNum
       });
      
      newUrl.save(function (err, newUrl) {
        if (err) return console.error(err);
      });
      
      var urlObject = newUrl.toObject();
      delete urlObject['_id'];
      
      res.json(urlObject);
        
      });
      
    }
    
  });
  
}

function saveOne(){
  
  urlModel.findOne({'original_url':'https://www.google.com'}, function(err, theOne){
    
    if (err) return console.error(err);
    
    if (theOne != null){
      
      console.log('already exists:' + newUrl);
      
    } else {
      
      var newUrl = new urlModel({ 
        original_url: 'https://www.google.com',
        short_url: 'https://urle.herokuapp.com/1'
       });
      
      newUrl.save(function (err, newUrl) {
        if (err) return console.error(err);
        console.log('saved' + newUrl);
      });
      
    }
    
  });

}

//https://gist.github.com/dperini/729294
var re_weburl = new RegExp(
  "^" +
    // protocol identifier
    "(?:(?:https?|ftp)://)" +
    // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
      // IP address exclusion
      // private & local networks
      "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
      "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broacast addresses
      // (first & last IP address of each class)
      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
      // host name
      "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
      // domain name
      "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
      // TLD identifier
      "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
      // TLD may end with dot
      "\\.?" +
    ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:[/?#]\\S*)?" +
  "$", "i"
);