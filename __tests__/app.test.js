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

// GET endpoint tests begin
describe("GET: /[Nonexistent Endpoint]", () => {
  describe("404: Not found", () => {
    test("Invalid endpoint should respond with not found", () => {
      return request(app)
        .get("/api/doesntexist")
        .expect(404)
        .then(({ body: { error } }) => {
          expect(error).toBe("Not Found");
        });
    });
  });
});
describe("GET: /api", () => {
  describe("200: Success", () => {
    test("Responds with an object detailing the documentation for each endpoint", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body: { endpoints } }) => {
          expect(endpoints).toEqual(endpointsJson);
        });
    });
  });
});

describe("GET: /api/topics", () => {
  describe("200: Success", () => {
    test("Responds with an object containing an array of topic objects, containing a slug and a description property", () => {
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
});

describe("GET: /api/articles/:article_id", () => {
  describe("200: Success", () => {
    test("Responds with the correct article object", () => {
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
  });
  describe("400: Bad Request", () => {
    test("400: Responds with bad request when ID is not a number", () => {
      return request(app)
        .get("/api/articles/mitch")
        .expect(400)
        .then(({ body: { error } }) => {
          expect(error).toBe("Bad Request");
        });
    });
  });
  describe("404: Not Found", () => {
    test("Responds with not found when ID is out of range", () => {
      return request(app)
        .get("/api/articles/9001")
        .expect(404)
        .then(({ body: { error } }) => {
          expect(error).toBe("Not Found");
        });
    });
  });
});

describe("GET: /api/articles", () => {
  describe("200: Success", () => {
    test("Should respond with an array of article objects, containing all articles in the DB.", () => {
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
describe("GET: /api/articles/:article_id/comments", () => {
  describe("200: Success", () => {
    test("should return an object with an array all of the relevant comments", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(11);
        });
    });
    test("Each comment object should contain the following properties: comment_id, votes, created_at, author, body, article_id", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          comments.forEach((comment) => {
            expect(Object.keys(comment).length).toBe(6);
            // prettier-ignore
            expect(comment).toMatchObject({
              comment_id:   expect.toBeNumber(true),
              votes:        expect.toBeNumber(true),
              created_at:   expect.toBeDateString(true),
              author:       expect.toBeString(true),
              body:         expect.toBeString(true),
              article_id:   expect.toBeNumber(true)
            });
          });
        });
    });
    test("The comments should be returned sorted in descending order by created_at time (most recent first)", () => {
      return request(app)
        .get("/api/articles/3/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("If the article exists but there are no comments, should still return 200 but with an appropriate message.", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toBe("There are no comments on this article.");
        });
    });
  });
  describe("400: Bad Request", () => {
    test("Responds with Bad Request error if the article ID is not a number", () => {
      return request(app)
        .get("/api/articles/myfavouritearticle/comments")
        .expect(400)
        .then(({ body: { error } }) => {
          expect(error).toBe("Bad Request");
        });
    });
  });
  describe("404: Not Found", () => {
    test("Responds with a Not Found error when article ID is out of range", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then(({ body: { error } }) => {
          expect(error).toBe("Not Found");
        });
    });
  });
});
// GET endpoint tests end

// POST endpoint tests begin
describe("POST: /api/articles/:article_id/comments", () => {
  describe("200: Success", () => {
    test("should take an object with a body and an author and return the posted comment, which has all the relevant keys added to it", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ body: "This is a comment", author: "butter_bridge" })
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(Object.keys(comment).length).toBe(6);
          // prettier-ignore
          expect(comment).toMatchObject({
            comment_id:   expect.toBeNumber(true),
            votes:        expect.toBeNumber(true),
            created_at:   expect.toBeDateString(true),
            author:       "butter_bridge",
            body:         "This is a comment",
            article_id:   1
          });
        });
    });
  });
  describe("400: Bad Request", () => {
    test("If provided body has missing/invalid keys, should return a Bad Request", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          title: "This is a title",
          author: "Harrie",
        })
        .expect(400)
        .then(({ body: { error } }) => {
          expect(error).toBe("Bad Request");
        });
    });

    test("If provided article ID is not a number, should return Bad Request", () => {
      return request(app)
        .post("/api/articles/myfavouritearticle/comments")
        .send({ body: "This is a comment", author: "butter_bridge" })
        .expect(400)
        .then(({ body: { error } }) => {
          expect(error).toBe("Bad Request");
        });
    });
  });
  describe("401: Unauthorised", () => {
    test("If user does not exist, should return Unauthorised", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ body: "This is a comment", author: "Harrie" })
        .expect(401)
        .then(({ body: { error } }) => {
          expect(error).toBe("Unauthorised");
        });
    });
  });
  describe("404: Not Found", () => {
    test("If article does not exist, should return Not Found", () => {
      return request(app)
        .post("/api/articles/999/comments")
        .send({ body: "This is a comment", author: "butter_bridge" })
        .expect(404)
        .then(({ body: { error } }) => {
          expect(error).toBe("Not Found");
        });
    });
  });
});
// POST endpoint tests end
