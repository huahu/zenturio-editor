var zenturioEditor = angular.module('zenturio-editor', []);

// todo: wite angular controllers here

$(function() {
  $(document).foundation();
});

function toggleInfoBlock() {
  $('.left-side').toggleClass('large-8');
  $('.left-side').toggleClass('large-12');

  $('.right-side').toggle();
}

var loadedIds =  [];

function loadTree(id, subpath) {
  if (loadedIds[id]) {
    $('#rowModelFiles'+id).toggle();
  } else {
    $.get('/tree-inner', {subpath:subpath}, function(data) {
      $('#rowModelFiles'+id+" .inner-dir").html(data);
      $('#rowModelFiles'+id).show();
      loadedIds[id] = true;
    });
  }

}