const { query } = require('express');
const express = require('express');
const router  = express.Router();
const helpers = require('../helpers');

module.exports = (db) => {

  // render the "View Contributions" page for story_id
  router.get("/:storyID/view_contributions", (req, res) => {

    const userID = req.session["user_id"];
    let user;
    let userVoted;

    // req.params.storyID can be edited in the URL so this might expose us to SQL injection: https://stackoverflow.com/questions/52945517/is-it-a-vulnerability-to-use-req-params-directly-in-an-express-js-route-without
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
      console.log('user', data);
      user = data;
      return db.query(queryStringOne);
    })
    .then((data) => {
      console.log('userVoted', data.rows);
      userVoted = data.rows;
      return db.query(queryStringTwo);
    })
    .then((data) => {
      console.log('contributions', data.rows);
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
  router.post("/:storyID/contributions/:contributionID/upvote", (req, res) => {

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
    const userID = req.session["user_id"];
    let user;

    let storyTitle;
    const queryString = `
    SELECT title
    FROM stories
    WHERE stories.id = $1;
    `;
    const queryParams = [req.params.storyID];

    db.query(queryString, queryParams)
    .then((data) => {
      storyTitle = data.rows[0].title;
      helpers.getUserWithID(userID);
    })
    .then((data) => {
      user = data;
      const templateVars = { user, storyTitle };
      res.render("create_contribution", templateVars);
    })
  });

  router.post("/:storyID/create_contribution", (req, res) => {

    console.log(req.body);

    const userID = req.session["user_id"];
    const storyID = req.params.storyID;
    const content = req.body.entry;
    const animation = (req.body.animation || null);
    const sound = (req.body.sound || null);
    const photo = (req.body.photo || 1); // leaving 1 in as the default photo to be used for all photo-less entries, otherwise we would have to adjust EJS files to accommodate queries with no photos;
    const textPosition = 'bottom';
    let order;

    // Do a query to determine what number to assign to order
    const queryString1 = `
    SELECT COUNT(contributions.id) as contributions_count
    FROM stories
    LEFT JOIN contributions ON (story_id = stories.id AND contributions.status = 'accepted')
    WHERE story_id = $1
    `
    const queryParams1 = [storyID]

    const queryString2 = `
    INSERT INTO contributions (contributor_id, story_id, photo_id, animation_id, ambient_sound_id, text_position, content, order_rank)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;

    db.query(queryString1, queryParams1)
    .then((data) => {
      const order = 2 + Number(data.rows[0]["contributions_count"]);
      const queryParams2 = [userID, storyID, photo, animation, sound, textPosition, content, order];
      return db.query(queryString2, queryParams2);
    })
    .then((data) => {
      console.log("DATA 2", data);
      const storyID = data.rows[0]["story_id"];
      res.redirect(`/stories/${storyID}/view`);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  })

  return router;

};
