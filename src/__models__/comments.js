const db = require("../../db/connection");
exports.selectComments = (article_id) => {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
      [article_id]
    )
    .then(({ rows }) => rows);
};

exports.selectCommentById = (comment_id) => {
  return db
    .query("SELECT * FROM comments WHERE comment_id = $1", [comment_id])
    .then(({ rows }) => rows[0]);
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
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          error: "Not Found",
          msg: "Can't delete a comment that does not exist",
        });
      }
    });
};

exports.updateComment = (comment_id, body) => {
  let sql = "";
  const args = [];
  if (body.inc_votes) {
    sql += `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`;
    args.push(body.inc_votes);
    args.push(comment_id);
  }
  return db.query(sql, args).then(({ rows }) => rows[0]);
};
