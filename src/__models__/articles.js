const db = require("../../db/connection");
exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      } else return rows[0];
    });
};

exports.selectArticles = () => {
  return db
    .query(
      `SELECT article_id, title, topic, author, created_at, votes, article_img_url, 
        (SELECT COUNT(*)::INT FROM comments WHERE article_id = articles.article_id) AS comment_count
        FROM articles ORDER BY articles.created_at DESC`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.updateArticle = (article_id, body) => {
  let sql = "";
  const args = [];
  if (body.inc_votes) {
    sql += `UPDATE articles SET votes = votes + ${body.inc_votes} WHERE article_id = $1 RETURNING *`;
    args.push(article_id);
  }
  return db.query(sql, args).then(({ rows }) => rows[0]);
};
