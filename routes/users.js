const express = require('express');
const cookieSession = require("cookie-session");
const router  = express.Router();

router.use(cookieSession({
  name: "session",
  keys: ["secret-key"]
}));

module.exports = (db) => {

  // Login Route
  router.get("/login/:userID", (req, res) => {
    req.session["user_id"] = req.params.userID;
    res.redirect("/");
  });

  // Logout Route
  router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
  });

  return router;

};
