const endpointsJson = require("./endpoints.json");
const db = require("./db/connection");

const express = require("express");
const app = express();

app.get("/api", (request, response, next) => {
  response.status(200).send({ endpoints: endpointsJson });
});

module.exports = app;
