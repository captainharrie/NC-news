const db = require("../../db/connection");
exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 1) {
        return rows[0];
      } else return Promise.reject({ status: 404, msg: "Not Found" });
    });
};
