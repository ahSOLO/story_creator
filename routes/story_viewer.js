const express = require('express');
const router  = express.Router();
const helpers = require('../helpers');

module.exports = (db) => {

  // render the "View Story" page for story_id
  router.get("/:storyID/view", (req, res) => {

    const userID = req.session["user_id"];
    let user;
    let entries;
    let pendingContributions;
    let authors = [];
    let authorString = '';

    const queryString1 = `
    SELECT stories.id as story_id, stories.title as title, creators.name as creator, contributors.name as contributor, creator_animations.type as creator_animation, creator_photos.photo_url as creator_photo, stories.first_entry as first_entry, creator_sounds.type as creator_sound, contributions.order_rank as ord, contributor_animations.type as contributor_anim, contributor_photos.photo_url as contributor_photo, contributions.content as contributor_entry, contributor_sounds.type as contributor_sound, contributions.text_position as contributor_position, stories.status as story_status
    FROM stories
    LEFT JOIN contributions ON (story_id = stories.id AND contributions.status = 'accepted')
    LEFT JOIN users creators ON creator_id = creators.id
    LEFT JOIN users contributors ON contributor_id = contributors.id
    LEFT JOIN photos creator_photos ON creator_photos.id = stories.photo_id
    LEFT JOIN photos contributor_photos ON contributor_photos.id = contributions.photo_id
    LEFT JOIN animations creator_animations ON creator_animations.id = stories.animation_id
    LEFT JOIN animations contributor_animations ON contributor_animations.id = contributions.animation_id
    LEFT JOIN ambient_sounds creator_sounds ON creator_sounds.id = stories.ambient_sound_id
    LEFT JOIN ambient_sounds contributor_sounds ON contributor_sounds.id = contributions.ambient_sound_id
    WHERE stories.id = $1
    ORDER BY ord;`;
    const queryParams1 = [req.params.storyID];
    const queryString2 =`
    SELECT MIN(photos.photo_url) as photo_url, contributions.id as id, contributions.content as content, COUNT(upvotes) as upvotes,
    MAX(
      CASE WHEN upvotes.user_id = $2 THEN 1
      WHEN upvotes.user_id != $2 THEN 0
      END) as user_voted
      FROM stories
      JOIN contributions ON (stories.id = story_id AND contributions.status = 'pending')
      LEFT JOIN photos ON contributions.photo_id = photos.id
      LEFT JOIN upvotes ON upvotes.contribution_id = contributions.id
      WHERE stories.id = $1
      GROUP BY contributions.id
      ORDER BY COUNT(upvotes) DESC, contributions.created_at DESC
      LIMIT 3;`;
    const queryParams2 = [req.params.storyID, userID]

    helpers.getUserWithID(userID)
    .then((data) => {
      user = data;
      return db.query(queryString1, queryParams1);
    })
    .then((data) => {
      entries = data.rows;

      authors.push(entries[0]["creator"]);
      for (entry of entries) {
        if (!authors.includes(entry.contributor)) {
          authors.push(entry.contributor);
        }
      };
      for (const [index, author] of authors.entries()) {
        if (author) {
          if (authors.length > 1 && index === authors.length - 1) {
            authorString += ` and ${author}`;
          } else if (index === 0) {
            authorString += author;
          } else {
            authorString += `, ${author}`;
          }
        }
      };

      return db.query(queryString2, queryParams2);
    })
    .then((data) => {
      pendingContributions = (data.rows)
      const templateVars = {
        entries,
        authorString,
        pendingContributions,
        storyID:req.params.storyID,
        user
      };
      res.render("view_story", templateVars);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  });

  // render the "Preview" page for a pending contribution

  router.get("/preview/:contributionID", (req, res) => {

    db.query(`
    SELECT animations.type as animation, photos.photo_url as photo, ambient_sounds.type as sound, contributions.content as content
    FROM contributions
    LEFT JOIN animations on animations.id = animation_id
    LEFT JOIN photos on photos.id = photo_id
    LEFT JOIN ambient_sounds on ambient_sounds.id = ambient_sound_id
    WHERE contributions.id = $1;
    `, [req.params.contributionID])
    .then( (data) => {
      const templateVars = data.rows[0];
      templateVars.title = null;
      templateVars.user = null;
      res.render('preview', templateVars);
    });

  });

  // render the "Preview" page for a create story or create contribution form

  router.post("/preview", (req, res) => {

    let title = req.body.title;
    let animation = null;
    let photo;
    let sound = null;
    let content = req.body.content;
    let user;

    // Get user name
    db.query(`
    SELECT name
    FROM users
    WHERE users.id = $1
    `, [req.session.user_id])
    .then((data) => {
      user = data.rows[0].name;
      // Get animation type
      if (req.body.animation) {
        return db.query(`
        SELECT type
        FROM animations
        WHERE animations.id = $1
        `, [req.body.animation]);
      } else {
        return null;
      }
    })
    .then((data) => {
      if (data) animation = data.rows[0].type;
      // Get photo url
      return db.query(`
      SELECT photo_url
      FROM photos
      WHERE photos.id = $1
      `, [(req.body.photo || 1)]);
    })
    .then((data) => {
      photo = data.rows[0].photo_url;
      // Get sound type
      if (req.body.sound) {
        return db.query(`
        SELECT type
        FROM ambient_sounds
        WHERE ambient_sounds.id = $1
        `, [req.body.sound]);
      } else {
        return null;
      }
    })
    .then((data) => {
      if (data) sound = data.rows[0].type;
      res.render('preview', {title, animation, photo, sound, content, user});
    });
  });

  return router;

};
