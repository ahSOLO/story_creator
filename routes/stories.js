const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  // render the "Create Story" page for user_id
  router.get("/create", (req, res) => {
    res.render("create_story");
  });

  // render the "Edit Story" page for story_id
  router.get("/edit/:storyID", (req, res) => {

    const storyID = req.params.storyID;
    const queryString = `
    SELECT s.*, c.content, u.name, count(distinct v.id) as upvotes
    FROM stories s
    LEFT JOIN contributions c
    ON s.id = c.story_id AND c.status = 'pending'
    LEFT JOIN users u
    ON c.contributor_id = u.id
    LEFT JOIN upvotes v
    ON c.id = v.contribution_id
    WHERE s.id = ${storyID}
    GROUP BY s.id, c.content, u.name;
    `;

    db.query(queryString)
    .then((data) => {
      const contributions = data.rows;
      const templateVars = {
        contributions
      };
      res.render("edit_stories", templateVars);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // render the "My Stories" page for user_id
  router.get("/list/", (req, res) => {
    res.render("my_stories");
  });

  // render the "View Story" page for story_id
  router.get("/view/:storyID", (req, res) => {
    res.render("view_story");
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
