var EDITOR = null;

$(function() {
  $(document).foundation();
  if ($.cookie('info_block_hidden') == "yes") {
    toggleInfoBlock();
  }

  $('#modeSelect').change(function() {
    if (EDITOR) {
      EDITOR.getSession().setMode("ace/mode/" + $(this).val());
    }
  });
});

function toggleInfoBlock() {
  // $('.left-side').toggleClass('large-8');
  // $('.left-side').toggleClass('end');

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