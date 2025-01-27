const endpointsJson = require("../endpoints.json");
const app = require("../app");
const request = require("supertest");

const data = require("../db/data/test-data/");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});
describe("GET to an invalid endpoint", () => {
  test("404: Invalid endpoint should respond with not found", () => {
    return request(app)
      .get("/api/doesntexist")
      .expect(404)
      .then(({ body: { error } }) => {
        expect(error).toBe("Not Found");
      });
  });
});
describe("GET /api/topics", () => {
  test("200: Responds with an object containing and array of topic objects, containing a slug and a description property", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic.hasOwnProperty("slug")).toBe(true);
          expect(topic.hasOwnProperty("description")).toBe(true);
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with the correct article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(Object.keys(article).length).toBe(8);
        expect(typeof article.author).toBe("string");
        expect(typeof article.title).toBe("string");
        expect(typeof article.article_id).toBe("number");
        expect(typeof article.body).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
      });
  });
  test("404: Responds with not found when ID is out of range", () => {
    return request(app)
      .get("/api/articles/9001")
      .expect(404)
      .then(({ body: { error } }) => {
        expect(error).toBe("Not Found");
      });
  });
  test("400: Responds with bad request when ID is not a number", () => {
    return request(app)
      .get("/api/articles/mitch")
      .expect(400)
      .then(({ body: { error } }) => {
        expect(error).toBe("Bad Request");
      });
  });
});
