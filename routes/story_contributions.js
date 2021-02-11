const express = require('express');
const router  = express.Router();

const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const helpers = require('../helpers');

module.exports = (db) => {

  // render the "View Contributions" page for story_id
  router.get("/:storyID/view_contributions", (req, res) => {

    const userID = req.session["user_id"];
    let user;
    const queryString = `
    SELECT c.*, MIN(p.photo_url) as photo_url, COUNT(v.id) as upvotes,
    MAX(
      CASE WHEN v.user_id = $2 THEN 1
      WHEN v.user_id != $2 THEN 0
      END) as user_voted
    FROM contributions c
    LEFT JOIN photos p
    ON c.photo_id = p.id
    LEFT JOIN upvotes v
    ON v.contribution_id = c.id
    WHERE c.story_id = $1
    AND c.status = 'pending'
    GROUP BY c.id
    ORDER BY COUNT(v.id) DESC;
    `;

    helpers.getUserWithID(userID)
    .then((data) => {
      console.log('user', data);
      user = data;
      return db.query(queryString, [req.params.storyID, userID]);
    })
    .then((data) => {
      console.log('contributions', data.rows);
      const contributions = data.rows;
      const templateVars = {
        contributions,
        user
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
    SELECT id, title
    FROM stories
    WHERE stories.id = $1;
    `;
    const queryParams = [req.params.storyID];

    db.query(queryString, queryParams)
    .then((data) => {
      story = data.rows[0];
      helpers.getUserWithID(userID);
    })
    .then((data) => {
      user = data;
      const templateVars = {
        user,
        story
      };
      res.render("create_contribution", templateVars);
    })
  });

  // Suggest a new set of photos based on contribution sentiment
  router.post('/contribution/suggest_photos', function(req, res) {

    const entry = req.body.entry;
    const entrySentiment = sentiment.analyze(entry);
    const entryScore = entrySentiment["score"] / entrySentiment["words"].length || 0;

    let generalSentiment;
    if (entryScore <= -3) {
      generalSentiment = 'Sounds like your story might be on the darker side!';
    } else if (entryScore < -1) {
      generalSentiment = 'Sounds like your story might be a little bit dark!';
    } else if (entryScore <= 1) {
      generalSentiment = 'The tone of your story sounds fairly neutral.';
    } else if (entryScore > 1) {
      generalSentiment = 'Sounds like you want to write a positive story!';
    } else {
      generalSentiment = 'Your story sounds really happy!';
    };
    generalSentiment += ' How about one of these to be the cover photo?'

    const queryString = `
    SELECT *
    FROM photos
    WHERE abs(score - ${entryScore}) <= 1
    ORDER BY random()
    LIMIT 4
    `

    db.query(queryString)
    .then((data) => {
      const photoData = {
        photoOneID: data.rows[0]["id"],
        photoOne: data.rows[0]["photo_url"],
        photoTwoID: data.rows[1]["id"],
        photoTwo: data.rows[1]["photo_url"],
        photoThreeID: data.rows[2]["id"],
        photoThree: data.rows[2]["photo_url"],
        photoFourID: data.rows[3]["id"],
        photoFour: data.rows[3]["photo_url"],
        generalSentiment,
        entryScore
      };
      res.json(photoData);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // Create a contribution
  router.post("/:storyID/create_contribution", (req, res) => {
    const userID = req.session["user_id"];
    const storyID = req.params.storyID;
    const content = req.body.entry;
    const animation = (req.body.animation || null);
    const sound = (req.body.sound || null);
    const photo = (req.body.photo || 1); // leaving 1 in as the default photo to be used for all photo-less entries, otherwise we would have to adjust EJS files to accommodate queries with no photos;
    const textPosition = 'bottom';

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

    const queryString3 = `
    INSERT INTO upvotes (user_id, contribution_id) VALUES ($1, $2);
    `;

    db.query(queryString1, queryParams1)
    .then((data) => {
      const order = 2 + Number(data.rows[0]["contributions_count"]);
      const queryParams2 = [userID, storyID, photo, animation, sound, textPosition, content, order];
      return db.query(queryString2, queryParams2);
    })
    .then((data) => {
      console.log(data.rows);
      const contribution_id = data.rows[0].id;
      const queryParams3 = [userID, contribution_id];
      return db.query(queryString3, queryParams3);
    })
    .then(() => {
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
