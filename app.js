const endpointsJson = require("./endpoints.json");
const db = require("./db/connection");

const express = require("express");
const { getTopics } = require("./src/__controllers__/topics");
const {
  getArticleById,
  getArticles,
} = require("./src/__controllers__/articles");
const { getComments, postComment } = require("./src/__controllers__/comments");
const app = express();

app.use(express.json());

app.get("/api", (request, response, next) => {
  response.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id/comments", getComments);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);

app.post("/api/articles/:article_id/comments", postComment);

//errors

app.get("*", (request, response, next) => {
  response.status(404).send({ error: "Not Found" });
});

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
