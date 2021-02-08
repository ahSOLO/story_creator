const openNav = function () {
  $("nav").css('left','0px');
}

const closeNav = function () {
  $("nav").css('left','-320px')
}

$(() => {
  $('#open_nav').on('click', openNav);
  $('#close_nav').on('click', closeNav);
});
