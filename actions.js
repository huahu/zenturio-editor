var fs = require('fs');
var path = require('path');

var idInd = 1;
var loadedInfo = [];
var EXTS = require('./modes.js');
var coreParentDir = null;
var coreDir = null;

function existsAndIsFile(fullPath) {
  var stats = fs.lstatSync(fullPath);
  return fs.existsSync(fullPath) && !stats.isDirectory();
}

/**
 * Extract full path from request. source = (req.body or req.query)
 **/
function extractFullPath(source) {
  return coreParentDir + decodeURIComponent(source.subpath);
}

function getTreeItem(_path) {
  var model = {};
  model.id = idInd++;
  model.path = _path;
  model.subpath = _path.replace(coreParentDir, "");
  model.subpathUrl = encodeURIComponent(_path.replace(coreParentDir, ""));
  model.title = path.basename(_path);
  model.hidden = model.title[0] == '.';
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
    var fpath = _path + path.sep + file;
    var stats = fs.lstatSync(fpath);
    if (stats.isDirectory()) {
      _dirs.push(getTreeItem(fpath));
    } else {
      _files.push(getTreeItem(fpath));
    }
  }

  return _dirs.concat(_files);
}


module.exports = function(app, _coreDir, _coreParentDir) {
  coreDir = _coreDir;
  coreParentDir = _coreParentDir;

  app.get('/', function(req, res) {

    var model = getTreeItem(coreDir);

    res.render('tree', {
      model: model,
      page_title: model.title
    });
  });

  app.get('/tree-inner', function(req, res) {
    var fullPath = extractFullPath(req.query);
    var result = getTreeList(fullPath);

    res.render('tree-inner', {
      list: result,
      error: result === false
    });
  });

  app.get('/raw', function(req, res) {
    var fullPath = extractFullPath(req.query);
    
    if (!existsAndIsFile(fullPath)) {
      res.send(500, "Invalid subpath");
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
    var fullPath = extractFullPath(req.body);

    if (!fs.existsSync(fullPath)) {
      res.send(404, "404 Error. " + fullPath);
      return;
    }

    fullPath += path.sep + req.body.name;
    fs.mkdirSync(fullPath);

    res.send('Directory ' + fullPath + ' created');
  });

  app.post('/create-file', function(req, res) {
    var fullPath = extractFullPath(req.body);

    if (!fs.existsSync(fullPath)) {
      res.send(404, "404 Error. " + fullPath);
      return;
    }

    fullPath += path.sep + req.body.name;
    fs.openSync(fullPath, 'w');

    res.send('File ' + fullPath + ' created');
  });

  app.get('/editor', function(req, res) {
    var fullPath = extractFullPath(req.query);

    if (!fs.existsSync(fullPath)) {
      res.send(404, "404 Error");
      return;
    }

    var model = getTreeItem(fullPath);

    var ext = path.extname(fullPath);
    var mode = 'text';
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
        mode: mode,
        subpath: model.subpath,
        subpathUrl: model.subpathUrl
      });
    });
  });

  app.post('/delete-file', function(req, res) {
    var fullPath = extractFullPath(req.body);

    if (!fs.existsSync(fullPath)) {
      res.send(404, "404 Error");
      return;
    }

    var stats = fs.lstatSync(fullPath);
    if (stats.isDirectory()) {
      try {
        fs.rmdirSync(fullPath);
      } catch (err) {}
    } else {
      fs.unlinkSync(fullPath);
    }

    if (!fs.existsSync(fullPath)) {
      res.send("OK");
    } else {
      res.send(500, "Failed");
    }
  });


  app.post('/save-file', function(req, res) {
    var fullPath = extractFullPath(req.body);

    if (!fs.existsSync(fullPath)) {
      res.send(404, "404 Error");
      return;
    }

    var data = req.body.data;

    fs.writeFile(fullPath, data, function(err) {
      if (err) {
        res.send(500, 'Failed');
      } else {
        res.send("OK");
      }
    });
  });
  
  app.get('/search', function(req, res) {
    res.render('search', {
      page_title: "Searching"
    });
  });

};