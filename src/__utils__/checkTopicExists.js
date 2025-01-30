const db = require("../../db/connection");

exports.checkTopicExists = (topic) => {
  return db
    .query("SELECT * FROM topics WHERE slug = $1", [topic])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          error: "Not Found",
          msg: `The topic "${topic}" does not exist`,
        });
      } else return Promise.resolve(`The topic "${topic}" exists`);
    });
};
