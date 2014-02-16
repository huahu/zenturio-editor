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
var settings = {
  port: 3000
};

if (process.argv.length > 2) {
  for (var i = 2; i < process.argv.length; i++) {
    var item = process.argv[i];
    var regex  = /^--(.+)=(.+)$/;
    
    if (item.match(regex)) {
      var match = regex.exec(item);
      if (settings[match[1]]) {
        settings[match[1]] = match[2];
      }
    }
  }
}

app.listen(settings.port, function(err) {
  if (!err) {
    console.log('Zenturio Editor started at port ' + settings.port);
  }
});