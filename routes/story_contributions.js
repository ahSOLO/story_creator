const express = require('express');
const router  = express.Router();
const helpers = require('../helpers');

module.exports = (db) => {

  // render the "View Contributions" page for story_id
  router.get("/:storyID/view_contributions", (req, res) => {

    const userID = req.session["user_id"];
    let user;
    let userVoted;

    const queryStringOne = `
    SELECT v.*, s.id as story_id
    FROM upvotes v
    JOIN contributions c
    ON v.contribution_id = c.id and c.status = 'pending'
    JOIN stories s
    ON c.story_id = s.id
    WHERE s.id = ${req.params.storyID}
    AND user_id = ${userID}
    `;

    const queryStringTwo = `
    SELECT c.*, p.photo_url
    FROM contributions c
    LEFT JOIN photos p
    ON c.photo_id = p.id
    WHERE c.story_id = ${req.params.storyID}
    AND c.status = 'pending';
    `;

    helpers.getUserWithID(userID)
    .then((data) => {
      user = data;
      return db.query(queryStringOne);
    })
    .then((data) => {
      userVoted = data.rows;
      return db.query(queryStringTwo);
    })
    .then((data) => {
      const contributions = data.rows;
      const templateVars = {
        contributions,
        user,
        userVoted
      };
      res.render("view_contributions", templateVars);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // Create an upvote for a contribution
  router.post("/:storyID/contribution/:contributionID/upvote", (req, res) => {

    const userID = req.session["user_id"];
    const storyID = req.params.storyID;
    const contributionID = req.params.contributionID;

    const queryString = `
    INSERT INTO upvotes (user_id, contribution_id)
    VALUES ($1, $2) RETURNING *;
    `;

    db.query(queryString, [userID, contributionID])
    .then(() => {
      res.redirect(`/stories/${storyID}/view_contributions`);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // render the "Create Contribution" page for story_id
  router.get("/:storyID/create_contribution", (req, res) => {
    res.render("create_contribution");
  });

  return router;

};
