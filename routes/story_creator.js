const express = require('express');
const router  = express.Router();

const Sentiment = require('sentiment');
const sentiment = new Sentiment();

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

  // Suggest a new set of photos based on story sentiment
  router.post('/suggest_photos', function(req, res) {

    const title = req.body.title;
    const titleSentiment = sentiment.analyze(title);
    const titleScore = titleSentiment["score"] / titleSentiment["words"].length;

    const description = req.body.description;
    const descriptionSentiment = sentiment.analyze(description);
    const descriptionScore = descriptionSentiment["score"] / descriptionSentiment["words"].length;

    const entry = req.body.entry;
    const entrySentiment = sentiment.analyze(entry);
    const entryScore = entrySentiment["score"] / entrySentiment["words"].length;

    const scores = [titleScore, descriptionScore, entryScore]
    let sumScore = 0;
    let countScore = 0;
    for (score of scores) {
      if (score) {
        sumScore += score;
        countScore += 1;
      }
    }
    const totalScore = sumScore / countScore;

    let generalSentiment;
    if (totalScore <= -3) {
      generalSentiment = 'Sounds like your story might be on the darker side!';
    } else if (totalScore < -1) {
      generalSentiment = 'Sounds like your story might be a little bit dark!';
    } else if (totalScore <= 1) {
      generalSentiment = 'The tone of your story sounds fairly neutral.';
    } else if (totalScore > 1) {
      generalSentiment = 'Sounds like you want to write a positive story!';
    } else {
      generalSentiment = 'Your story sounds really happy!';
    };
    generalSentiment += ' How about one of these to be the cover photo?'

    const queryString = `
    SELECT *
    FROM photos
    WHERE abs(score - ${totalScore}) <= 1
    ORDER BY random()
    LIMIT 4
    `

    db.query(queryString)
    .then((data) => {
      const photoData = {
        photoOne: data.rows[0]["photo_url"],
        photoTwo: data.rows[1]["photo_url"],
        photoThree: data.rows[2]["photo_url"],
        photoFour: data.rows[3]["photo_url"],
        generalSentiment,
        totalScore
      };
      res.json(photoData);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  // Create a new story.
  router.post("/create_story", (req, res) => {
    const userID = req.session["user_id"];
    const title = req.body.title;
    const description = req.body.description;
    const firstEntry = req.body.entry;
    const animation = (req.body.animation || null);
    const sound = (req.body.sound || null);
    const photo = (req.body.photo || 1); // leaving 1 in as the default photo to be used for all photo-less entries, otherwise we would have to adjust EJS files to accommodate queries with no photos;
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