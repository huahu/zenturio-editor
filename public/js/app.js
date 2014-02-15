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