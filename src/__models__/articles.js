const db = require("../../db/connection");
exports.selectArticleById = (article_id) => {
  return db
    .query(
      "SELECT *, (SELECT COUNT(*)::INT FROM comments WHERE article_id = $1) AS comment_count FROM articles WHERE article_id = $1",
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          error: "Not Found",
          msg: "Article does not exist",
        });
      } else return rows[0];
    });
};

exports.selectArticles = ({
  sort_by = "created_at",
  order = "DESC",
  topic,
  limit = 10,
  offset = 0,
}) => {
  let sql = `
    SELECT articles.article_id, 
           articles.title, 
           articles.topic, 
           articles.author, 
           articles.created_at, 
           articles.votes, 
           articles.article_img_url, 
           COALESCE(article_comment_counts.comment_count, 0) AS comment_count
    FROM articles
    LEFT JOIN (
        SELECT comments.article_id, COUNT(*)::INT AS comment_count
        FROM comments
        GROUP BY comments.article_id
    ) AS article_comment_counts 
    ON article_comment_counts.article_id = articles.article_id
  `;
  const args = [];

  if (topic) {
    sql += "WHERE articles.topic = $1\n";
    args.push(topic);
  }

  const sortingGreenList = ["title", "topic", "author", "created_at", "votes"];

  if (sortingGreenList.includes(sort_by)) {
    sql += `ORDER BY articles.${sort_by} `;
  } else if (sort_by === "comment_count") {
    sql += `ORDER BY comment_count `;
  }

  if (order.toUpperCase() === "ASC" || order.toUpperCase() === "DESC") {
    sql += order.toUpperCase();
  } else sql += "DESC";

  sql += `\nLIMIT ${limit} OFFSET ${offset}`;
  return db.query(sql, args).then(({ rows }) => rows);
};

exports.updateArticle = (article_id, body) => {
  let sql = "";
  const args = [];
  if (body.inc_votes) {
    sql += `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *, (SELECT COUNT(*)::INT FROM comments WHERE article_id = $2) AS comment_count`;
    args.push(body.inc_votes);
    args.push(article_id);
  }
  return db.query(sql, args).then(({ rows }) => rows[0]);
};
