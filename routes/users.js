const express = require('express');
// const cookieSession = require("cookie-session");
const router  = express.Router();
const helpers = require('../helpers');

// router.use(cookieSession({
//   name: "session",
//   keys: ["secret-key"]
// }));

module.exports = (db) => {

  // Login Route
  router.get("/:userID/login", (req, res) => {
    req.session["user_id"] = req.params.userID;
    res.redirect("/");
  });

  // Logout Route
  router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
  });

  // Render the "My Stories" page for user_id
  router.get("/:userID/stories", (req, res) => {

    const userID = req.session["user_id"];
    let user;

    const queryString = `
    SELECT s.*, creator.name as creator, ', ' || string_agg(u.name, ', ') as contributors
    FROM stories s
    LEFT JOIN users creator
    ON s.creator_id = creator.id
    LEFT JOIN contributions c
    ON s.id = c.story_id AND c.status = 'accepted'
    LEFT JOIN users u
    ON c.contributor_id = u.id
    WHERE s.creator_id = ${req.params.userID}
    GROUP BY s.id, creator.name;
    `;

    helpers.getUserWithID(userID)
    .then((data) => {
      user = data;
      return db.query(queryString);
    })
    .then((data) => {
      const stories = data.rows
      templateVars = {
        stories,
        user
      };
      res.render("my_stories", templateVars);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // Render 401 page
  router.get("/access_denied", (req, res) => {

    const userID = req.session["user_id"];
    let user;

    helpers.getUserWithID(userID)
    .then((data) => {
      user = data;
      const templateVars = { user };
      res.render("no_access", templateVars);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  return router;

};
