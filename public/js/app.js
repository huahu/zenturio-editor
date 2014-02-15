$(function() {
  $(document).foundation();
  if ($.cookie('info_block_hidden') == "yes") {
    toggleInfoBlock();
  }
});

function toggleInfoBlock() {
  // $('.left-side').toggleClass('large-8');
  // $('.left-side').toggleClass('end');

  $('.right-side').toggleClass('hidden');
  $('.right-side').toggle();

  $.cookie('info_block_hidden', $('.right-side').hasClass('hidden') ? "yes" : "no");
}

var loadedIds = [];

function loadTree(id, subpath) {
  if (loadedIds[id]) {
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