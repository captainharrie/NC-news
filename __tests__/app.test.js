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
        expect(article.author).toBeString(true);
        expect(article.title).toBeString(true);
        expect(article.article_id).toBeNumber(true);
        expect(article.body).toBeString(true);
        expect(article.topic).toBeString(true);
        expect(article.created_at).toBeDateString(true);
        expect(article.votes).toBeNumber(true);
        expect(article.article_img_url).toBeString(true);
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

describe("GET /api/articles", () => {
  describe("200: should respond with an array of article objects.", () => {
    test("Should return all of the articles.", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
        });
    });
    test("Each article object should contain the following properties: author, title, article_id, topic, created_at, votes, article_img_url", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            expect(article.hasOwnProperty("author")).toBe(true);
            expect(article.hasOwnProperty("title")).toBe(true);
            expect(article.hasOwnProperty("article_id")).toBe(true);
            expect(article.hasOwnProperty("topic")).toBe(true);
            expect(article.hasOwnProperty("created_at")).toBe(true);
            expect(article.hasOwnProperty("votes")).toBe(true);
            expect(article.hasOwnProperty("article_img_url")).toBe(true);
          });
        });
    });
    test("Each article object should have had a comment_count added, which should be an integer", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            expect(article.hasOwnProperty("comment_count")).toBe(true);
            expect(article.comment_count).toBeNumber(true);
          });
        });
    });
    test("The comment_count value should be the expected count for each article.", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          const articlesWithComments = [
            { id: 1, count: 11 },
            { id: 3, count: 2 },
            { id: 5, count: 2 },
            { id: 6, count: 1 },
            { id: 9, count: 2 },
          ];

          articles.forEach((article) => {
            let expectedCount = 0;
            const comments = articlesWithComments.find(
              (comments) => comments.id === article.article_id
            );
            if (comments) expectedCount = comments.count;
            expect(article.comment_count).toBe(expectedCount);
          });
        });
    });
    test("The articles should by default be sorted by date, in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("There should not be a body property present on any of the article objects", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            expect(article.hasOwnProperty("body")).toBe(false);
          });
        });
    });
  });
});
