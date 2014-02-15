#!/usr/bin/env node

var express = require('express');
var fs = require('fs');
var app = express();
app.set('view engine', 'ejs');

app.use('/', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('tree');
});

app.get('/editor', function(req, res) {
  res.render('editor');
});

var port = 3000;
app.listen(port, function(err) {
  if (!err) {
    console.log('Zenturio Editor started at port ', port);
  }
});