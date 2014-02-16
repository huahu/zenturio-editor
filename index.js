#!/usr/bin/env node

var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();
var swig = require('swig');
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + path.sep + 'views');

// todo: change cache settings later
app.set('view cache', false);
swig.setDefaults({
  cache: false
});

app.use(express.urlencoded());

var coreDir = process.cwd();
var coreParentDir = path.dirname(coreDir);

app.use('/', express.static(__dirname + path.sep + 'public'));

require('./actions')(app, coreDir, coreParentDir);

var port = 3000;
app.listen(port, function(err) {
  if (!err) {
    console.log('Zenturio Editor started at port ' + port);
  }
});