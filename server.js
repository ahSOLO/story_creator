// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["secret-key"]
}));

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const userRoutes = require("./routes/users");
const storyCreatorRoutes = require("./routes/story_creator");
const storyEditorRoutes = require("./routes/story_editor");
const storyViewerRoutes = require("./routes/story_viewer");
const storyContributionRoutes = require("./routes/story_contributions");

// Import helper functions
const helpers = require('./helpers');

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/users", userRoutes(db));
app.use("/stories", storyCreatorRoutes(db));
app.use("/stories", storyEditorRoutes(db));
app.use("/stories", storyViewerRoutes(db));
app.use("/stories", storyContributionRoutes(db));
// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
// This one doesn't use Express router

// This route renders the home page
app.get("/", (req, res) => {

  const userID = req.session["user_id"];
  let user;

  const queryString = `
  SELECT s.*, u.name as creator, p.photo_url
  FROM stories s
  LEFT JOIN users u
  ON s.creator_id = u.id
  LEFT JOIN photos p
  ON s.photo_id = p.id
  ORDER BY s.status asc, s.created_at desc
  `;

  helpers.getUserWithID(userID)
  .then((data) => {
    user = data;
    return db.query(queryString);
  })
  .then((data) => {
    const stories = data.rows;
    const templateVars = {
      stories,
      user
    };
    res.render("front_page", templateVars);
  })
  .catch(err => {
    res
      .status(500)
      .json({ error: err.message });
  });

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
