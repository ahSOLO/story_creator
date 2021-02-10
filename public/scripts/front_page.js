$(() => {
  $('header').hide()
  let scrolltotop = document.scrollingElement.scrollTop;
  const intro = $("div.intro_scroll");
  if (scrolltotop >= 800) {
    intro.hide();
    $('header').slideDown();
  }
  $(document).on('scroll', () => {
    scrolltotop = document.scrollingElement.scrollTop;
    let windowHeight = window.innerHeight;
    intro.css("top", -scrolltotop/3);
    $("div.intro_scroll p#title").css("font-size", 3.5/(1 + scrolltotop/windowHeight) + "rem");
    if (scrolltotop >= 800) {
      intro.slideUp();
      $('header').slideDown();
    } else {
      intro.slideDown();
      $('header').slideUp();
    }
  });
  $('i.fa-angle-double-down').on('click', () => {
    $("body, html").animate(
      { scrollTop: $('#featured_stories_section').offset().top }
    );
  });
});
