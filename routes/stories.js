const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  // render the "Create Story" page for user_id
  router.get("/create", (req, res) => {
    res.render("create_story");
  });

  // render the "Edit Story" page for story_id
  router.get("/edit/:storyID", (req, res) => {
    res.render("edit_stories");
  });

  // render the "My Stories" page for user_id
  router.get("/list/", (req, res) => {
    res.render("my_stories");
  });

  // render the "View Story" page for story_id
  router.get("/view/:storyID", (req, res) => {
    const queryString = `
    SELECT stories.title as title, creators.name as creator, contributors.name as contributor, creator_animations.type as creator_animation, creator_photos.photo_url as creator_photo, stories.first_entry as first_entry, creator_sounds.type as creator_sound, contributions.order_rank as ord, contributor_animations.type as contributor_anim, contributor_photos as contributor_photo, contributions.content as entry, contributor_sounds.type as contributor_sound
    FROM stories
    JOIN contributions ON (story_id = stories.id AND contributions.status != 'pending')
    JOIN users creators ON creator_id = creators.id
    JOIN users contributors ON contributor_id = contributors.id
    JOIN photos creator_photos ON creator_photos.id = stories.photo_id
    JOIN photos contributor_photos ON contributor_photos.id = contributions.photo_id
    JOIN animations creator_animations ON creator_animations.id = stories.animation_id
    JOIN animations contributor_animations ON contributor_animations.id = contributions.animation_id
    JOIN ambient_sounds creator_sounds ON creator_sounds.id = stories.ambient_sound_id
    JOIN ambient_sounds contributor_sounds ON contributor_sounds.id = contributions.ambient_sound_id
    WHERE stories.id = $1;
    `
    const queryParams = [req.params.storyID]

    db.query(queryString, queryParams)
    .then((data) => {
      console.log(data.rows);
      const templateVars = data.rows;
      res.render("view_story", templateVars);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  });

  // "Create Story" button on homepage
  router.get("/create_story", (req, res) => {
    res.redirect("/stories/create");
  });

  // Create a new story.
  router.post("/create_story", (req, res) => {

    const userID = req.session["user_id"];
    const title = req.body.title;
    const description = req.body.description;
    const firstEntry = req.body.entry;
    const animation = undefined; // hardcoded. need to update so it takes user selection.
    const sound = undefined; // hardcoded. need to update so it takes user selection.
    const photo = 1; // hardcoded. need to update so it takes user selection.
    const queryParams = [userID, photo, animation, sound, title, description, firstEntry];

    const queryString = `
    INSERT INTO stories (creator_id, photo_id, animation_id, ambient_sound_id, title, description, first_entry)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;

    db.query(queryString, queryParams)
    .then((data) => {
      const storyID = data.rows[0]["id"];
      res.redirect(`/stories/edit/${storyID}`);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  return router;

};
