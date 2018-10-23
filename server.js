'use strict';

var http = require('http');
var express = require('express');
var request = require('request');
var path = require('path');
var bodyParser = require('body-parser')
var fs = require('fs')
var spawn = require('child_process')
var fileUpload = require('express-fileupload');
var hostString = process.argv[2]
var PORT = process.env.PORT || 8085;
var app = express();

var myJSON = JSON.parse(fs.readFileSync('product-catalog.json'));

app.use(bodyParser.json())
app.use(fileUpload());
// app.use(express.static(__dirname))
app.use(express.static('./public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/alpha.html'));
});

app.get('/statictweets/:search', function (req, res) {
      console.log('Calling twitter feed service at: ' + 'http://twitter-feed:30000/statictweets/' + encodeURIComponent(req.params.search));
      request('http://twitter-feed:30000/statictweets/' + encodeURIComponent(req.params.search), function (error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
          res.end(body);
        });
});

app.get('/color', function(req, res) {
  console.log('getting color from twitter feed');
  request('http://twitter-feed:30000/statictweets/color', function (error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
      res.end(body);
    });
});

app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  console.log('processing file upload');
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  const options = {
    method: 'POST',
    uri: 'http://my-release-fn-api/t/imgconvert/resize128',
    encoding: null,
    headers: {
      'Content-type': 'application/octet-stream'
    },
    body: sampleFile.data
  };

  request(options, function(error, response, body) {
    console.log('processing image thumbnail');
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
    if (response && response.statusCode == 200) {
      console.log('Status Code: ' + response.statusCode);
      fs.writeFile('public/thumbnail.png', body, 'binary', function(err){
          if (err) throw err
          console.log('File saved.')
          var options = {
            root: __dirname + '/public/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
          };
          // res.sendFile('thumbnail.png', options);
          res.send(body.toString('base64'));
      });
    }
    else {
      res.status(500);
      res.end();
    }
  });

  // setTimeout(() => res.redirect('/'), 1000);
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

});
