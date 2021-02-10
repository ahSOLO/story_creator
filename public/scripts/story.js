// Animations

let rain = function() {
  //clear out everything
  $('.rain').empty();

  let increment = 0;
  let drops = "";
  let backDrops = "";

  while (increment < 100) {
    //couple random numbers to use for various randomizations
    //random number between 98 and 1
    let randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
    //random number between 5 and 2
    let randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));
    //increment
    increment += randoFiver;
    //add in a new raindrop with various randomizations to certain CSS properties
    drops += '<div class="drop" style="left: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
    backDrops += '<div class="drop" style="right: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
  }

  $('.rain.front-row').append(drops);
  $('.rain.back-row').append(backDrops);
}

// Sounds

const natureSound = new Audio('/sounds/nature.mp3');
const stormSound = new Audio('/sounds/storm.mp3');
const oceanSound = new Audio('/sounds/ocean.mp3');
let muted = 0;

const stopSound = function (sound) {
  sound.pause();
  sound.currentTime = 0;
}
const refreshSound = function(sound) {
  // Stop previously playing sounds
  stopSound(natureSound);
  stopSound(stormSound);
  stopSound(oceanSound);

  if (muted === 0) {
    switch (sound) {
      case 'nature':
        natureSound.play();
        break;
      case 'storm':
        stormSound.play();
        break;
      case 'ocean':
        oceanSound.play();
        break;
    }
  }
}

// Page turning
let pageNum = 0;

$(() => {
  const pages = $("div.page");

  // Start raining if a rainwrapper is included in the page
  let autoRain = function() {
    $('.rainwrapper').each( (index, ele) => {
      if ($.contains(pages.get(pageNum), ele)) {
        rain();
      }
    });
  }

  const scrollDown = function() {
    let current = pageNum
    pageNum = Math.min(pageNum + 1, pages.length - 1);
    if (current !== pageNum) {
      return pages.eq(current).fadeOut(600, () => {
        pages.eq(pageNum).fadeIn(600, function() {
          autoRain();
          detectScroll();
          let soundType = $(this).find(`data#entry_${pageNum}_sound`).val();
          refreshSound(soundType);
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
          pages.eq(pageNum).fadeIn(600, function() {
            autoRain();
            detectScroll();
            let soundType = $(this).find(`data#entry_${pageNum}_sound`).val();
            refreshSound(soundType);
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

  // Sound control
  const soundControl = function() {
    let sound = null;
    if ($(this).attr('class') === 'fas fa-volume-mute') {
      muted = 0;
      sound = pages.eq(pageNum).find(`data#entry_${pageNum}_sound`).val()
    } else {
      muted = 1;
    }
    refreshSound(sound);
    $("div.volume_control i").removeClass('hidden');
    $(this).addClass("hidden");
  };

  // Attach event handlers for sound control
  $('.fa-volume-up').on('click', soundControl).removeClass('hidden');
  $('.fa-volume-mute').on('click', soundControl);
});
