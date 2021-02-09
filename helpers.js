const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);

// get user using their ID
const getUserWithID = function(userID) {
  const queryString = `
  SELECT id as user_id, name
  FROM users
  WHERE id = $1;
  `;
  return db.query(queryString, [userID])
    .then(res => res.rows[0]);
};
exports.getUserWithID = getUserWithID;
