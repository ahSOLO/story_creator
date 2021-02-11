const express = require('express');
const router  = express.Router();
const helpers = require('../helpers');

module.exports = (db) => {

  // render the "Edit Story" page for story_id
  router.get("/:storyID/edit", (req, res) => {

    const userID = req.session["user_id"];
    let user;

    const storyID = req.params.storyID;
    const queryString = `
    SELECT s.*, c.id as contribution_id, c.content, u.name, count(distinct v.id) as upvotes
    FROM stories s
    LEFT JOIN contributions c
    ON s.id = c.story_id AND c.status = 'pending'
    LEFT JOIN users u
    ON c.contributor_id = u.id
    LEFT JOIN upvotes v
    ON c.id = v.contribution_id
    WHERE s.id = ${storyID}
    GROUP BY s.id, c.id, c.content, u.name;
    `;

    helpers.getUserWithID(userID)
    .then((data) => {
      user = data;
      return db.query(queryString);
    })
    .then((data) => {
      const contributions = data.rows;
      const templateVars = {
        contributions,
        user,
        storyID
      };
      res.render("edit_stories", templateVars);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // Update story description from the "Edit Story" page
  router.post("/:storyID/update_description", (req, res) => {

    const storyID = req.params.storyID;
    const description = req.body.description;
    const queryParams = [description, storyID];

    const queryString = `
    UPDATE stories
    SET description = $1
    WHERE id = $2;
    `;

    db.query(queryString, queryParams)
    .then(() => {
      res.redirect(`/stories/${storyID}/edit`);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // Accept a contribution from the "Edit Story" page
  router.post("/:storyID/contributions/:contributionID/accept", (req, res) => {

    const storyID = req.params.storyID;
    const contributionID = req.params.contributionID;

    const queryStringOne = `
    UPDATE contributions
    SET status = 'accepted'
    WHERE id = $1;
    `;

    const queryStringTwo = `
    UPDATE contributions
    SET status = 'deleted'
    WHERE story_id = $1
    AND status = 'pending';
    `;

    db.query(queryStringOne, [contributionID])
    .then(db.query(queryStringTwo, [storyID]))
    .then(() => {
      res.redirect(`/stories/${storyID}/edit`);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // Delete a contribution from the "Edit Story" page
  router.post("/:storyID/contributions/:contributionID/delete", (req, res) => {

    const storyID = req.params.storyID;
    const contributionID = req.params.contributionID;

    const queryString = `
    UPDATE contributions
    SET status = 'deleted'
    WHERE id = $1;
    `;

    db.query(queryString, [contributionID])
    .then(() => {
      res.redirect(`/stories/${storyID}/edit`);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // Complete story from the "Edit Story" page
  router.post("/:storyID/complete", (req, res) => {

    const storyID = req.params.storyID;

    const queryString = `
    UPDATE stories
    SET status = 'complete'
    WHERE id = $1;
    `;

    db.query(queryString, [storyID])
    .then(() => {
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
