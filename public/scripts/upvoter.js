$(document).ready(function() {

  // Create upvote when upvote button is clicked
  $(".upvote").on("click", function(event) {
    const contributionID = $(this).data('contribution')
    $.ajax({
      type: 'POST',
      url: '/stories/contributions/upvote',
      data: {
        contributionID,
        userID: $(this).data('user')
      },
      success: function() {
        console.log(contributionID);
        updateVotes(contributionID);
      },
      error: function() {
        console.log('Error');
      }
    })
  });

  const updateVotes = function(contributionID) {
    $(`.upvote[data-contribution=${contributionID}]`).empty();
    $(`.upvote[data-contribution=${contributionID}]`).prop("disabled", true);
    $(`.upvote[data-contribution=${contributionID}]`).text("Voted");
    $(`.upvote[data-contribution=${contributionID}]`).attr('id', 'voted');
    $(`.upvote[data-contribution=${contributionID}]`).removeClass("upvote");

    const currentUpvotes = parseInt($(`.upvote_count[data-contribution=${contributionID}]`).text());
    const newUpvotes = currentUpvotes + 1;
    $(`.upvote_count[data-contribution=${contributionID}]`).empty();
    $(`.upvote_count[data-contribution=${contributionID}]`).text(newUpvotes);
  };

});
