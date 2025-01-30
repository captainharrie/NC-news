const endpointsJson = require("./endpoints.json");
const db = require("./db/connection");

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
} = require("./src/__controllers__/comments");
const { getUsers } = require("./src/__controllers__/users");
const app = express();

app.use(express.json());

// GET endpoints start
app.get("/api", (request, response, next) => {
  response.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id/comments", getComments);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/users", getUsers);
// GET endpoints end

// POST endpoints start
app.post("/api/articles/:article_id/comments", postComment);
// POST endpoints end

// PATCH endpoints start
app.patch("/api/articles/:article_id", patchArticle);
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
    response.status(error.status).send({ error: error.msg });
  } else next(error);
});

app.use((error, request, response, next) => {
  if (error.code === "22P02") {
    response.status(400).send({ error: "Bad Request" });
  } else next(error);
});

app.use((error, request, response, next) => {
  if (
    error.code === "23503" &&
    error.constraint === "comments_article_id_fkey"
  ) {
    response.status(404).send({ error: "Not Found" });
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
