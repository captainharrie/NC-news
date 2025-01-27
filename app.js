const endpointsJson = require("./endpoints.json");
const db = require("./db/connection");

const express = require("express");
const { getTopics } = require("./src/__controllers__/topics");
const app = express();

app.get("/api", (request, response, next) => {
  response.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send({ error: "Internal Server Error" });
});

module.exports = app;
