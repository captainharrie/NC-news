const endpointsJson = require("./endpoints.json");
const db = require("./db/connection");
const cors = require("cors");

const express = require("express");
const { getTopics } = require("./src/__controllers__/topics");
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("./src/__controllers__/articles");
const {
  getComments,
  postComment,
  deleteComment,
  patchComment,
  getCommentById,
} = require("./src/__controllers__/comments");
const { getUsers, getUserByID } = require("./src/__controllers__/users");
const app = express();

app.use(cors());
app.use(express.json());

// GET endpoints start
app.get("/api", (request, response, next) => {
  response.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id/comments", getComments);
app.get("/api/comment/:comment_id", getCommentById);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/users", getUsers);
app.get("/api/users/:username", getUserByID);
// GET endpoints end

// POST endpoints start
app.post("/api/articles/:article_id/comments", postComment);
// POST endpoints end

// PATCH endpoints start
app.patch("/api/articles/:article_id", patchArticle);
app.patch("/api/comment/:comment_id", patchComment);
// PATCH endpoints end

// DELETE endpoints start
app.delete("/api/comments/:comment_id", deleteComment);
// DELETE endpoints end

// Default responses
app.get("*", (request, response, next) => {
  response.status(404).send({ error: "Not Found" });
});

app.post("*", (request, response, next) => {
  response.status(405).send({ error: "Method Not Allowed" });
});

app.patch("*", (request, response, next) => {
  response.status(405).send({ error: "Method Not Allowed" });
});

app.delete("*", (request, response, next) => {
  response.status(405).send({ error: "Method Not Allowed" });
});

// Error Handling
app.use((error, request, response, next) => {
  if (error.status && error.msg) {
    response.status(error.status).send({ error: error.error, msg: error.msg });
  } else next(error);
});

app.use((error, request, response, next) => {
  if (error.code === "22P02") {
    response.status(400).send({ error: "Bad Request", msg: "Invalid ID" });
  } else next(error);
});

app.use((error, request, response, next) => {
  if (
    error.code === "23503" &&
    error.constraint === "comments_article_id_fkey"
  ) {
    response
      .status(404)
      .send({ error: "Not Found", msg: "Article does not exist" });
  } else next(error);
});

app.use((error, request, response, next) => {
  if (error.code === "23503" && error.constraint === "comments_author_fkey") {
    response.status(401).send({ error: "Unauthorised" });
  } else next(error);
});

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send({ error: "Internal Server Error" });
});

module.exports = app;
