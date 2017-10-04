var express = require('express')
var app = express()
var request = require('request');
var rp = require('request-promise');
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080

var YELP_TOKEN = null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


app.use(express.static(__dirname + '/public'))

//listen for the server

app.get('/yelp', function(req, res) {
    console.log(req.query)
    if (typeof req.query.searchTerm !== 'undefined') {
      var searchTerm = req.query.searchTerm;
    }
    if (typeof req.query.location !== 'undefined') {
      var location = req.query.location;
    }
    if (typeof req.query.lat !== 'undefined') {
      var lat = req.query.lat;
    }
    if (typeof req.query.lng !== 'undefined') {
      var lng = req.query.lng;
    }
    
    if (!YELP_TOKEN) {
      var options = {
          method: 'POST',
          uri: 'https://api.yelp.com/oauth2/token',
          formData: {
              client_id: 'WWcW2n1i-VxHNA1520GXJA',
              client_secret: '8vM6ZF3SjcEymx2E9ul5X3PQnYvDbTZxEHqBkKeugKCGluKpqNxr414eNXnrIiNz',
              grant_type: 'client_credentials'
          }
      };
      rp(options)
        .then(function(result) {
          console.log(result)
          YELP_TOKEN = JSON.parse(result).access_token;
          var url = 'https://api.yelp.com/v3/businesses/search?term=' + searchTerm;
          if (typeof location !== 'undefined') {
            url += '&location=' + location;
          }else if (typeof lat !== 'undefined' && typeof lng !== 'undefined') {
            url += '&latitude=' + lat + '&longitude=' + lng;
          }
          var options = {
              method: 'GET',
              uri: url,
              headers: {
                  'Authorization': 'Bearer ' + YELP_TOKEN
              }
          };
          rp(options)
              .then(function (data) {
                  res.json(JSON.parse(data))
              })
              .catch(function (err) {
                  console.log(err);
              });
        })
        .catch(function(err) {
          console.log(err);
        })
    } else {
      var url = 'https://api.yelp.com/v3/businesses/search?term=' + searchTerm;
      if (typeof location !== 'undefined') {
        url += '&location=' + location;
      }else if (typeof lat !== 'undefined' && typeof lng !== 'undefined') {
        url += '&latitude=' + lat + '&longitude=' + lng;
      }
      var options = {
          method: 'GET',
          uri: url,
          headers: {
              'Authorization': 'Bearer ' + YELP_TOKEN
          }
      };
      rp(options)
          .then(function (data) {
            res.json(JSON.parse(data))
          })
          .catch(function (err) {
              console.log(err);
          });
    }
})

app.get('/hunter', function(req, res) {
  console.log(req.query)
  if (typeof req.query.businessUrl !== 'undefined') {
    var businessUrl = req.query.businessUrl;
  }
  var url = 'https://api.hunter.io/v2/domain-search';
  if (typeof businessUrl !== 'undefined') {
    url += '?domain=' + businessUrl;
  }
  url += '&api_key=ae2f419b22fcf725379b54db12a63212d008c72d&limit=50';
  var options = {
      method: 'GET',
      uri: url
  };
  rp(options)
      .then(function (data) {
        res.json(JSON.parse(data))
      })
      .catch(function (err) {
          console.log(err);
      });
})

app.get('/unified', function(req, res) {
  console.log(req.query)
  var promiseArr = [];

  if (typeof req.query.businessUrl !== 'undefined') {
    var businessUrl = req.query.businessUrl;
  }

  var hunterUrl = 'https://api.hunter.io/v2/domain-search';
  if (typeof businessUrl !== 'undefined') {
    hunterUrl += '?domain=' + businessUrl;
  }
  hunterUrl += '&api_key=ae2f419b22fcf725379b54db12a63212d008c72d&limit=50';
  var hunterOptions = {
      method: 'GET',
      uri: hunterUrl
  };
  promiseArr.push(rp(hunterOptions));

  var fullContactUrl = 'https://api.fullcontact.com/v2/company/lookup.json';
  if (typeof businessUrl !== 'undefined') {
    fullContactUrl += '?domain=' + businessUrl;
  }
  var fullContactOptions = {
      method: 'GET',
      uri: fullContactUrl,
      headers: {
        'X-FullContact-APIKey': '29ecdaae61bf307a'
      }
  };
  promiseArr.push(rp(fullContactOptions));

  Promise.all(promiseArr)
    .then(function(data) {
      console.log(data)
      var hunterData = JSON.parse(data[0]);
      var fullContactData = JSON.parse(data[1]);
      var unifiedData = {};
      for(var key in hunterData) unifiedData[key] = hunterData[key];
      for(var key in fullContactData) unifiedData[key] = fullContactData[key];
      res.json(unifiedData);
    })
    .catch(function(err) {
      console.log(err);
    })
})

app.listen(port, function(error){
  if(error){
    console.error('ERROR starting server!', error)
  } else{
    console.log('Server started successfully on port:', port)
  }
})