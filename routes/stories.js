const express = require('express');
// const path = require('path');
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
    res.render("view_stories");
  });

  // "Create Story" button on homepage
  router.get("/create_story", (req, res) => {
    res.redirect("/stories/create");
  });

  return router;

};
