const express = require('express');
const router  = express.Router();
const helpers = require('../helpers');

module.exports = (db) => {

  // render the "View Story" page for story_id
  router.get("/:storyID/view", (req, res) => {

    const userID = req.session["user_id"];
    let user;

    let entries;
    let pendingContributions;
    const queryString1 = `
    SELECT stories.title as title, creators.name as creator, contributors.name as contributor, creator_animations.type as creator_animation, creator_photos.photo_url as creator_photo, stories.first_entry as first_entry, creator_sounds.type as creator_sound, contributions.order_rank as ord, contributor_animations.type as contributor_anim, contributor_photos.photo_url as contributor_photo, contributions.content as contributor_entry, contributor_sounds.type as contributor_sound, contributions.text_position as contributor_position    FROM stories
    LEFT JOIN contributions ON (story_id = stories.id AND contributions.status = 'accepted')
    JOIN users creators ON creator_id = creators.id
    LEFT JOIN users contributors ON contributor_id = contributors.id
    JOIN photos creator_photos ON creator_photos.id = stories.photo_id
    LEFT JOIN photos contributor_photos ON contributor_photos.id = contributions.photo_id
    JOIN animations creator_animations ON creator_animations.id = stories.animation_id
    LEFT JOIN animations contributor_animations ON contributor_animations.id = contributions.animation_id
    JOIN ambient_sounds creator_sounds ON creator_sounds.id = stories.ambient_sound_id
    LEFT JOIN ambient_sounds contributor_sounds ON contributor_sounds.id = contributions.ambient_sound_id
    WHERE stories.id = $1
    ORDER BY ord;`;
    const queryParams = [req.params.storyID]
    const queryString2 =`
    SELECT MIN(photos.photo_url) as photo_url, contributions.content as content
    FROM stories
    JOIN contributions ON (stories.id = story_id AND contributions.status = 'pending')
    JOIN photos ON contributions.photo_id = photos.id
    JOIN upvotes ON upvotes.contribution_id = contributions.id
    WHERE stories.id = $1
    GROUP BY contributions.id
    ORDER BY COUNT(upvotes)
    LIMIT 3;`;

    helpers.getUserWithID(userID)
    .then((data) => {
      user = data;
      return db.query(queryString1, queryParams);
    })
    .then((data) => {
      entries = data.rows;
      return db.query(queryString2, queryParams);
    })
    .then((data) => {
      pendingContributions = (data.rows)
      const templateVars = { entries, pendingContributions, storyID:req.params.storyID, user };
      res.render("view_story", templateVars);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  });

  // render the "View Contributions" page for story_id
  router.get("/:storyID/view_contributions", (req, res) => {
    res.render("view_contributions");
  });

  // render the "Create Contribution" page for story_id
  router.get("/:storyID/create_contribution", (req, res) => {
    res.render("create_contribution");
  });

  return router;

};
