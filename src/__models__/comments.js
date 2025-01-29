const db = require("../../db/connection");
exports.selectComments = (article_id) => {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
      [article_id]
    )
    .then(({ rows }) => rows);
};

exports.insertComment = (body, article_id, author) => {
  return db
    .query(
      "INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *",
      [body, article_id, author]
    )
    .then(({ rows }) => rows[0]);
};

exports.dropComment = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
      comment_id,
    ])
    .then(({ rows }) => rows);
};
