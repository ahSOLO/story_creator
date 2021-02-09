const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  // render the "My Stories" page for user_id
  router.get("/list/user_id/:userID", (req, res) => {

    const userID = req.session["user_id"];
    let user;
    let queryGetUser;
    if (userID) {
      queryGetUser = `
      SELECT name
      FROM users
      WHERE id = ${userID};
      `;
    } else {
      queryGetUser = 'SELECT null;'
    }

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

    db.query(queryGetUser)
    .then((data) => {
      user = data.rows[0];
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

  // render the "View Story" page for story_id
  router.get("/view/story_id/:storyID", (req, res) => {

    const userID = req.session["user_id"];
    let user;
    let queryGetUser;
    if (userID) {
      queryGetUser = `
      SELECT name
      FROM users
      WHERE id = ${userID};
      `;
    } else {
      queryGetUser = 'SELECT null;'
    }

    let entries;
    let pendingContributions;
    const queryString1 = `
    SELECT stories.title as title, creators.name as creator, contributors.name as contributor, creator_animations.type as creator_animation, creator_photos.photo_url as creator_photo, stories.first_entry as first_entry, creator_sounds.type as creator_sound, contributions.order_rank as ord, contributor_animations.type as contributor_anim, contributor_photos.photo_url as contributor_photo, contributions.content as contributor_entry, contributor_sounds.type as contributor_sound, contributions.text_position as contributor_position    FROM stories
    LEFT JOIN contributions ON (story_id = stories.id AND contributions.status = 'accepted')
    JOIN users creators ON creator_id = creators.id
    LEFT JOIN users contributors ON contributor_id = contributors.id
    JOIN photos creator_photos ON creator_photos.id = stories.photo_id
    LEFT JOIN photos contributor_photos ON contributor_photos.id = contributions.photo_id
    JOIN animations creator_animations ON creator_animations.id = stories.animation_id
    LEFT JOIN animations contributor_animations ON contributor_animations.id = contributions.animation_id
    JOIN ambient_sounds creator_sounds ON creator_sounds.id = stories.ambient_sound_id
    LEFT JOIN ambient_sounds contributor_sounds ON contributor_sounds.id = contributions.ambient_sound_id
    WHERE stories.id = $1
    ORDER BY ord;`;
    const queryParams = [req.params.storyID]
    const queryString2 =`
    SELECT MIN(photos.photo_url) as photo_url, contributions.content as content
    FROM stories
    JOIN contributions ON (stories.id = story_id AND contributions.status = 'pending')
    JOIN photos ON contributions.photo_id = photos.id
    JOIN upvotes ON upvotes.contribution_id = contributions.id
    WHERE stories.id = $1
    GROUP BY contributions.id
    ORDER BY COUNT(upvotes)
    LIMIT 3;`;

    db.query(queryGetUser)
    .then((data) => {
      user = data.rows[0];
      return db.query(queryString1, queryParams);
    })
    .then((data) => {
      entries = data.rows;
      return db.query(queryString2, queryParams);
    })
    .then((data) => {
      pendingContributions = (data.rows)
      const templateVars = { entries, pendingContributions, storyID:req.params.storyID, user };
      res.render("view_story", templateVars);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  });

  // render the "View Contributions" page for story_id
  router.get("/view_contributions/story_id/:storyID", (req, res) => {
    res.render("view_contributions");
  });

  // render the "Create Contribution" page for story_id
  router.get("/create_contribution/story_id/:storyID", (req, res) => {
    res.render("create_contribution");
  });

  return router;

};
