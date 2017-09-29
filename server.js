var express = require('express')
var app = express()
var request = require('request');
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080

var YELP_TOKEN = null;

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


app.use(express.static(__dirname + '/public'))

//listen for the server

app.get('/yelp', function(req, res) {
    console.log(req.params)
    var searchTerm = req.params;
    // if (!YELP_TOKEN) {

    // } else {
    //     rp('http://www.google.com')
    //         .then(function (htmlString) {
    //             // Process html...
    //         })
    //         .catch(function (err) {
    //             // Crawling failed...
    //         });
    // }
    
})

app.listen(port, function(error){
  if(error){
    console.error('ERROR starting server!', error)
  } else{
    console.log('Server started successfully on port:', port)
  }
})