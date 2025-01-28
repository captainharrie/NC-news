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
  test("200: Responds with an object containing an array of topic objects, containing a slug and a description property", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          // prettier-ignore
          expect(topic).toMatchObject({
            slug:         expect.toBeString(true),
            description:  expect.toBeString(true),
          });
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
        // prettier-ignore
        expect(article).toMatchObject({
          author:           "butter_bridge",
          title:            "Living in the shadow of a great man",
          article_id:       1,
          body:             "I find this existence challenging",
          topic:            "mitch",
          created_at:       expect.toBeDateString(true),
          votes:            100,
          article_img_url:  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        })
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
    test("Each article object should contain the following properties: author, title, article_id, topic, created_at, votes, article_img_url, and comment_count", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            expect(Object.keys(article).length).toBe(8);
            // prettier-ignore
            expect(article).toMatchObject({
              author:           expect.toBeString(true),
              title:            expect.toBeString(true),
              article_id:       expect.toBeNumber(true),
              topic:            expect.toBeString(true),
              created_at:       expect.toBeDateString(true),
              votes:            expect.toBeNumber(true),
              article_img_url:  expect.toBeString(true),
              comment_count:    expect.toBeNumber(true),
            })
          });
        });
    });
    test("The comment_count value should be the expected count for each article.", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          const articlesWithComments = [
            { article_id: 1, comment_count: 11 },
            { article_id: 3, comment_count: 2 },
            { article_id: 5, comment_count: 2 },
            { article_id: 6, comment_count: 1 },
            { article_id: 9, comment_count: 2 },
          ];

          articles.forEach((article) => {
            let expectedCount = 0;
            const comments = articlesWithComments.find(
              (comments) => comments.article_id === article.article_id
            );
            if (comments) expectedCount = comments.comment_count;
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
