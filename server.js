'use strict';

var http = require('http');
var express = require('express');
var request = require('request');
var path = require('path');
var bodyParser = require('body-parser')
var fs = require('fs')
var hostString = process.argv[2]
var PORT = process.env.PORT || 8085;
var app = express();

var myJSON = JSON.parse(fs.readFileSync('product-catalog.json'));

app.use(bodyParser.json())
// app.use(express.static(__dirname))
app.use(express.static('./public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/alpha.html'));
});

app.get('/statictweets/:search', function (req, res) {

      request('http://twitter-feed:30000/statictweets/' + req.params.search, function (error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
          res.end(body);
        });
});

/*
 * route /products has been replaced in this example with static JSON data
 */

app.get('/products', function(req, res) {

	console.log('/products api called')

    res.end(JSON.stringify(myJSON));
});

app.get('/searchProductNames', function(req, res) {

	console.log('/productNames api called')

  res.end(JSON.stringify(
    myJSON.Products
    .filter(product => product.PRODUCT_NAME.includes(req.query.term))
    .map(
      product => (({PRODUCT_NAME, PRODUCT_ID}) => ({PRODUCT_NAME, PRODUCT_ID}))(product)
    )));

});

app.get('/productNames', function(req, res) {

	console.log('/productNames api called');
  res.end(JSON.stringify(
    myJSON.Products.map(
      product => (({PRODUCT_NAME, PRODUCT_ID}) => ({PRODUCT_NAME, PRODUCT_ID}))(product)
    )));
});

app.get('/product/:id', function(req, res) {

	console.log('/product api called')
  res.end(JSON.stringify(
    myJSON.Products.filter(product => product.PRODUCT_ID == req.params.id)
  ));
});

app.listen(PORT, function() {
	console.log('AlphaOffice listening on port ' + PORT);
	http.get('twitter-feed/statictweets', res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      console.log('found some tweets: ' + body);
    });
  });

});
