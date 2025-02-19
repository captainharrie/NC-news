const db = require("../../db/connection");
exports.selectUsers = () => {
  return db.query("SELECT * FROM users").then(({ rows }) => rows);
};
exports.selectUserByID = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows }) => rows[0]);
};
