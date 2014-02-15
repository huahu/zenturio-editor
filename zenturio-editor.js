#!/usr/bin/env node

var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();
var swig = require('swig');
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// todo: change cache settings later
app.set('view cache', false);
swig.setDefaults({
  cache: false
});

app.use(express.urlencoded());

var coreDir = process.cwd();
var coreParentDir = path.dirname(coreDir);

app.use('/', express.static(__dirname + '/public'));

var idInd = 1;

var loadedInfo = [];

function getTreeItem(_path) {
  var model = {};
  model.id = idInd++;
  model.path = _path;
  model.subpath = _path.replace(coreParentDir, "");
  model.subpathUrl = encodeURIComponent(_path.replace(coreParentDir, ""));
  model.title = path.basename(_path);
  var stats = fs.lstatSync(_path);
  model.type = stats.isDirectory() ? 'dir' : 'file';
  loadedInfo[_path] = model;
  return model;
}

function getTreeList(_path) {
  var _dirs = [];
  var _files = [];
  if (!fs.existsSync(_path)) {
    return false;
  }

  var files = fs.readdirSync(_path);
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var fpath = _path + '/' + file;
    var stats = fs.lstatSync(fpath);
    if (stats.isDirectory()) {
      _dirs.push(getTreeItem(fpath));
    } else {
      _files.push(getTreeItem(fpath));
    }
  };

  return _dirs.concat(_files);
}

app.get('/', function(req, res) {

  var model = getTreeItem(coreDir);

  res.render('tree', {
    model: model,
    page_title: model.title
  });
});

app.get('/tree-inner', function(req, res) {
  var fullPath = coreParentDir + req.query.subpath;
  var result = getTreeList(fullPath);

  res.render('tree-inner', {
    list: result,
    error: result === false
  });
});

app.get('/raw', function(req, res) {
  var fullPath = coreParentDir + req.query.subpath;

  if (!fs.existsSync(fullPath)) {
    res.send(404, "404 Error");
    return;
  }

  var stats = fs.lstatSync(fullPath);
  if (stats.isDirectory()) {
    res.send(500, "500 Error");
    return;
  }

  var mime = require('mime');
  var contentType = mime.lookup(fullPath);

  if (contentType == 'application/octet-stream' || contentType == 'application/x-sh') {
    contentType = 'text/plain';
    res.setHeader('Content-Type', contentType);

    fs.readFile(fullPath, 'utf8', function(err, data) {
      if (err) {
        res.send(500, "500 Error");
        return;
      }

      res.send(data);
    });
  } else {
    res.sendfile(fullPath);
  }

});

app.post('/create-dir', function(req, res) {
  var fullPath = coreParentDir + req.body.subpath;

  if (!fs.existsSync(fullPath)) {
    res.send(404, "404 Error. " + fullPath);
    return;
  }

  fullPath += '/' + req.body.name;
  fs.mkdirSync(fullPath);

  res.send('Directory ' + fullPath + ' created');
})

app.post('/create-file', function(req, res) {
  var fullPath = coreParentDir + req.body.subpath;

  if (!fs.existsSync(fullPath)) {
    res.send(404, "404 Error. " + fullPath);
    return;
  }

  fullPath += '/' + req.body.name;
  fs.openSync(fullPath, 'w')

  res.send('File ' + fullPath + ' created');
})


var EXTS = require('./modes.js');

app.get('/editor', function(req, res) {
  var fullPath = coreParentDir + req.query.subpath;

  if (!fs.existsSync(fullPath)) {
    res.send(404, "404 Error");
    return;
  }

  var model = getTreeItem(fullPath);

  var ext = path.extname(fullPath);
  var mode = false;
  if (EXTS[ext]) {
    mode = EXTS[ext];
  }

  fs.readFile(fullPath, 'utf8', function(err, data) {
    if (err) {
      res.send(500, "500 Error");
      return;
    }

    res.render('editor', {
      model: model,
      page_title: model.title,
      data: data,
      mode: mode
    });
  });


});

var port = 3000;
app.listen(port, function(err) {
  if (!err) {
    console.log('Zenturio Editor started at port ', port);
  }
});