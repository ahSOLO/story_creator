const express = require('express');
const router  = express.Router();
const helpers = require('../helpers');

module.exports = (db) => {

  // render the "Create Story" page for user_id
  router.get("/create", (req, res) => {
    const userID = req.session["user_id"];
    let user;

    helpers.getUserWithID(userID)
    .then((data) => {
      user = data;
      const templateVars = { user };
      res.render("create_story", templateVars);
    })
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
      res.redirect(`/stories/${storyID}/edit`);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  return router;

};
