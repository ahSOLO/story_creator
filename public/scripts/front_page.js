$(() => {
  $('header').hide()
  $(document).on('scroll', () => {
    let scrolltotop = document.scrollingElement.scrollTop;
    let windowHeight = window.innerHeight;
    const intro = $("div.intro_scroll");
    intro.css("top", -scrolltotop/3);
    $("div.intro_scroll p#title").css("font-size", 3.5/(1 + scrolltotop/windowHeight) + "rem");
    if (scrolltotop >= 800) {
      intro.slideUp();
    } else {
      intro.slideDown();
    }

    if (scrolltotop >= 900) {
      $('header').slideDown();
    } else {
      $('header').slideUp();
    }
  })
});
