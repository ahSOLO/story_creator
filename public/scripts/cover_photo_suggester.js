$(document).ready(function() {

  // Load initial set of photos
  $.ajax({
    type: 'POST',
    url: '/stories/cover_photo/initial',
    success: function(data) {
      loadPhotos(data);
    },
    error: function() {
      console.log('Error');
    }
  })

  // Function for generating photos
  const loadPhotos = function(photoData) {
    $.ajax({
      url: `/stories/create`,
      method: "GET"
    })
    .then(function() {
      const sentiment = `
      <p>${photoData.generalSentiment}</p>
      `;
      $('#sentiment').empty();
      $('#sentiment').append(sentiment);

      const photos = `
      <input class="photo" type="radio" id="photo_1" name="photo" value="${photoData.photoOneID}">
      <label class="photo" for="photo_1"><img src="${photoData.photoOne}"></label>
      <input class="photo" type="radio" id="photo_2" name="photo" value="${photoData.photoTwoID}">
      <label class="photo" for="photo_2"><img src="${photoData.photoTwo}"></label>
      <input class="photo" type="radio" id="photo_3" name="photo" value="${photoData.photoThreeID}">
      <label class="photo" for="photo_3"><img src="${photoData.photoThree}"></label>
      <input class="photo" type="radio" id="photo_4" name="photo" value="${photoData.photoFourID}">
      <label class="photo" for="photo_4"><img src="${photoData.photoFour}"></label>
      `;
      $('.suggested_photos').empty();
      $('.suggested_photos').append(photos);
    });
  };

  // When the Refresh Photos button is clicked, grab the inputs to run sentiment analysis
  $("#refresh_photos").on("click", function(event) {
    event.preventDefault();
    $(this).blur();
    $.ajax({
      type: 'POST',
      url: '/stories/cover_photo/suggest_photos',
      data: {
        title: $('#title').val(),
        description: $('#description').val(),
        entry: $('#entry').val()
      },
      success: function(data) {
        loadPhotos(data);
      },
      error: function() {
        console.log('Error');
      }
    })
  });

});
