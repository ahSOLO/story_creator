let pageNum = 0;

$(() => {
  const pages = $("div.page");

  const scrollDown = function() {
    let current = pageNum
    pageNum = Math.min(pageNum + 1, pages.length - 1);
    if (current !== pageNum) {
      return pages.eq(current).fadeOut(600, () => {
        console.log(pages.eq(pageNum));
        pages.eq(pageNum).fadeIn(600, () => {
          detectScroll();
        });
      });
    }
    return detectScroll();
  };

  const scrollUp = function() {
    if (pageYOffset === 0) {
      let current = pageNum
      pageNum = Math.max(pageNum - 1, 0);
      if (current !== pageNum) {
        return pages.eq(current).fadeOut(600, () => {
          console.log(pages.eq(pageNum));
          pages.eq(pageNum).fadeIn(600, () => {
            detectScroll();
          });
        });
      }
    }
    return detectScroll();
  };

  const detectScroll = () => {
    $(window).on('mousewheel', function(event) {
      $(window).off('mousewheel');
      if (event.originalEvent.wheelDelta >= 0) {
        return scrollUp();
      } else {
        return scrollDown();
      }
    });
  };

  // Hide all pages but first
  pages.slice(1).hide();
  detectScroll();

});
