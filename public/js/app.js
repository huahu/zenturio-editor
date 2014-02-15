var EDITOR = null;
var SUBPATH = null;

function toggleInfoBlock() {
  $('.left-side').toggleClass('large-8');
  $('.left-side').toggleClass('large-9');

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
  'less': 'LESS',
  'ruby': 'Ruby',
  'python': 'Python',
  'java': 'Java',
  'csharp': 'C#',
  'c_cpp': 'C / C++',
  'markdown': 'Markdown',
  'text': 'Plain Text',
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

function confirmExit() {
  return 'File was changed. You may lose your data now...';
}

function attachWarningOnClose() {
  window.onbeforeunload = confirmExit;
}

function deattachWarningOnClose() {
  window.onbeforeunload = null;
}

function triggerSaved() {
  $('#savedLabel').fadeIn(700, function() {
    $('#savedLabel').fadeOut(600);
  });
}

function triggerUnSaved() {
  $('#unsavedLabel').fadeIn(700, function() {
    $('#unsavedLabel').fadeOut(600);
  });
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
    EDITOR.setShowPrintMargin(false);
    EDITOR.setShowInvisibles(true);
    EDITOR.setHighlightSelectedWord(true);
    EDITOR.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true
    });

    EDITOR.getSession().on('change', function(e) {
      attachWarningOnClose();
    });

    EDITOR.getSession().setMode("ace/mode/" + startMode);
    EDITOR.commands.addCommand({
      name: 'SaveCommand',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S'
      },
      exec: function(editor) {
        $.ajax({
          url: '/save-file',
          type: 'POST',
          data: {
            subpath: SUBPATH,
            data: EDITOR.getValue()
          }
        }).done(function() {
          triggerSaved();
          deattachWarningOnClose();
        }).error(function() {
          triggerUnSaved();
        });
      },
      readOnly: false
    });
  }

});