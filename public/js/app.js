var EDITOR = null;

function toggleInfoBlock() {
  $('.right-side').toggleClass('hidden');
  $('.right-side').toggle();

  $.cookie('info_block_hidden', $('.right-side').hasClass('hidden') ? "yes" : "no");
}

var loadedIds = [];

function loadTree(id, subpath, ignoreCached) {
  if (loadedIds[id] && !ignoreCached) {
    $('#rowModelFiles' + id).toggle();
  } else {
    $.get('/tree-inner', {
      subpath: subpath
    }, function(data) {
      $('#rowModelFiles' + id + " .inner-dir").html(data);
      $('#rowModelFiles' + id).show();
      loadedIds[id] = true;
    });
  }
}

function createDir(id, subpath) {
  var str = prompt("Enter name of directory in " + subpath);
  if (str) {
    $.post('/create-dir', {
      subpath: subpath,
      name: str
    }, function() {
      loadTree(id, subpath, true);
    });
  }
}

function createFile(id, subpath) {
  var str = prompt("Enter name of file in " + subpath);
  if (str) {
    $.post('/create-file', {
      subpath: subpath,
      name: str
    }, function() {
      loadTree(id, subpath, true);
    });
  }
}

var modes = {
  'javascript': 'JavaScript',
  'php': 'PHP',
  'html': 'HTML',
  'twig': 'Twig',
  'css': 'CSS',
  'scss': 'SCSS',
  'sass': 'SASS',
  'less': 'Less',
  'ruby': 'Ruby',
  'python': 'Python',
  'java': 'Java',
  'csharp': 'C#',
  'c_cpp': 'C, C++',
  'markdown': 'Markdown',
  'text': 'Plain text',
  'xml': 'XML',
  'yaml': 'YAML',
  'sh': 'Bash'
};

function modeLabel(currMode) {
  $('#curMode').html(modes[currMode]);
}

function showChangeMode() {
  $('#modesWheel').toggle();
}

function changeMode(mode) {
  $('#modesWheel').hide();
  if (EDITOR) {
    EDITOR.getSession().setMode("ace/mode/" + mode);
    modeLabel(mode);
  }
}


var startMode = 'text';
$(function() {
  $(document).foundation();

  if ($.cookie('info_block_hidden') == "yes") {
    toggleInfoBlock();
  }

  if ($('#editor').length > 0) {
    ace.require("ace/ext/language_tools");
    EDITOR = ace.edit("editor");
    EDITOR.setTheme("ace/theme/idle_fingers");
    EDITOR.getSession().setTabSize(2);
    document.getElementById('editor').style.fontSize = '15px';
    EDITOR.setShowPrintMargin(false);
    EDITOR.setShowInvisibles(true);
    EDITOR.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true
    });

    EDITOR.getSession().setMode("ace/mode/" + startMode);
  }

});