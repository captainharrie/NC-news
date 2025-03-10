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
          expect(Object.keys(article).length).toBe(9);
          // prettier-ignore
          expect(article).toMatchObject({
            author:           "butter_bridge",
            title:            "Living in the shadow of a great man",
            article_id:       1,
            body:             "I find this existence challenging",
            topic:            "mitch",
            created_at:       expect.toBeDateString(true),
            comment_count:    11,
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
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Bad Request");
          expect(msg).toBe("Invalid ID");
        });
    });
  });
  describe("404: Not Found", () => {
    test("Responds with not found when ID is out of range", () => {
      return request(app)
        .get("/api/articles/9001")
        .expect(404)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Not Found");
          expect(msg).toBe("Article does not exist");
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
          expect(articles.length).toBe(10);
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
    describe("Queries", () => {
      test("The articles should by default be sorted by date, in descending order, when no query is provided", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });
      test("should take a sort_by query and sort the data by the provided column name", () => {
        return request(app)
          .get("/api/articles?sort_by=title")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(10);
            expect(articles).toBeSortedBy("title", { descending: true });
          })
          .then(() => {
            return request(app)
              .get("/api/articles?sort_by=author")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(10);

                expect(articles).toBeSortedBy("author", { descending: true });
              });
          })
          .then(() => {
            return request(app)
              .get("/api/articles?sort_by=votes")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(10);

                expect(articles).toBeSortedBy("votes", { descending: true });
              });
          })
          .then(() => {
            return request(app)
              .get("/api/articles?sort_by=comment_count")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(10);

                expect(articles).toBeSortedBy("comment_count", {
                  descending: true,
                });
              });
          });
      });
      test("should take an order query and sort the data in that order", () => {
        return request(app)
          .get("/api/articles?order=asc")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(10);
            expect(articles).toBeSortedBy("created_at", { descending: false });
          })
          .then(() => {
            return request(app)
              .get("/api/articles?order=desc")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(10);
                expect(articles).toBeSortedBy("created_at", {
                  descending: true,
                });
              });
          })

          .then(() => {
            return request(app)
              .get("/api/articles?sort_by=title&order=desc")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(10);
                expect(articles).toBeSortedBy("title", { descending: true });
              });
          })

          .then(() => {
            return request(app)
              .get("/api/articles?sort_by=title&order=asc")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(10);
                expect(articles).toBeSortedBy("title", { descending: false });
              });
          });
      });
      test("should take a topic query and filter the results to articles with that topic", () => {
        return request(app)
          .get("/api/articles?topic=mitch")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(10);
            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });
      test("should take a limit query and return less than or equal to that amount of articles, defaulting to 10", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(10);
          })
          .then(() => {
            return request(app)
              .get("/api/articles?limit=5")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(5);
              });
          })
          .then(() => {
            return request(app)
              .get("/api/articles?limit=20")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(13);
              });
          });
      });
      test("should take an offset query, returning the next set of articles following that offset", () => {
        return request(app)
          .get("/api/articles?limit=20")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            return articles;
          })
          .then((allArticles) => {
            return request(app)
              .get("/api/articles?limit=10&offset=10")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(3);
                expect(articles[0]).toEqual(allArticles[10]);
                expect(articles[1]).toEqual(allArticles[11]);
                expect(articles[2]).toEqual(allArticles[12]);
              });
          });
      });
      test("if topic exists, but does not have any articles, return an empty array", () => {
        return request(app)
          .get("/api/articles?topic=paper")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toEqual([]);
          });
      });
      test("should ignore invalid queries", () => {
        return request(app)
          .get("/api/articles?sort=asc")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(10);
            expect(articles).toBeSortedBy("created_at", { descending: true });
          })
          .then(() => {
            return request(app)
              .get("/api/articles?order=ascending")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(10);
                expect(articles).toBeSortedBy("created_at", {
                  descending: true,
                });
              });
          });
      });
    });
  });
  describe("404: Not Found", () => {
    test("if filtering by a topic that does not exist, should return a not found error", () => {
      return request(app)
        .get("/api/articles?topic=cooking")
        .expect(404)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Not Found");
          expect(msg).toBe('The topic "cooking" does not exist');
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
    test("If the article exists but there are no comments, should still return 200 with an empty array.", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual([]);
        });
    });
  });
  describe("400: Bad Request", () => {
    test("Responds with Bad Request error if the article ID is not a number", () => {
      return request(app)
        .get("/api/articles/myfavouritearticle/comments")
        .expect(400)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Bad Request");
          expect(msg).toBe("Invalid ID");
        });
    });
  });
  describe("404: Not Found", () => {
    test("Responds with a Not Found error when article ID is out of range", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Not Found");
          expect(msg).toBe("Article does not exist");
        });
    });
  });
});

describe("GET: /api/users", () => {
  describe("200: Success", () => {
    test("Responds with an object containing an array of user objects, containing a username, a name, and an avatar_url property", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users.length).toBe(4);
          users.forEach((user) => {
            expect(Object.keys(user).length).toBe(3);
            // prettier-ignore
            expect(user).toMatchObject({
              username:     expect.toBeString(true),
              name:         expect.toBeString(true),
              avatar_url:   expect.toBeString(true),
            });
          });
        });
    });
  });
});

describe("GET: /api/users/:username", () => {
  describe("200: Success", () => {
    test("Responds with a user object, containing a username, a name, and an avatar_url property", () => {
      return request(app)
        .get("/api/users/icellusedkars")
        .expect(200)
        .then(({ body: { user } }) => {
          expect(Object.keys(user).length).toBe(3);
          // prettier-ignore
          expect(user).toMatchObject({
            username:     "icellusedkars",
            name:         "sam",
            avatar_url:   "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
          });
        });
    });
  });
});

describe("GET: /api/comment/:comment_id", () => {
  describe("200: Success", () => {
    test("Responds with a comment object, containing a comment_id matching the request, an article_id, an author, a body, a number of votes, and a created_at date", () => {
      return request(app)
        .get("/api/comment/1")
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(Object.keys(comment).length).toBe(6);
          // prettier-ignore
          expect(comment).toMatchObject({
            comment_id:	  1,
            article_id:	  expect.toBeNumber(true),
            author:	      expect.toBeString(true),
            body:       	expect.toBeString(true),
            votes:	      expect.toBeNumber(true),
            created_at:	  expect.toBeDateString(true)
          });
        });
    });
  });
});
// GET endpoint tests end

// POST endpoint tests begin
describe("POST: /[Nonexistent Endpoint]", () => {
  describe("405: Method Not Allowed", () => {
    test("Invalid endpoint should respond with not allowed", () => {
      return request(app)
        .post("/api/doesntexist")
        .expect(405)
        .then(({ body: { error } }) => {
          expect(error).toBe("Method Not Allowed");
        });
    });
  });
});
describe("POST: /api/articles/:article_id/comments", () => {
  describe("201: Created", () => {
    test("should take an object with a body and an author and return the posted comment, which has all the relevant keys added to it", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ body: "This is a comment", author: "butter_bridge" })
        .expect(201)
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
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Bad Request");
          expect(msg).toBe("Invalid or missing keys");
        });
    });

    test("If provided article ID is not a number, should return Bad Request", () => {
      return request(app)
        .post("/api/articles/myfavouritearticle/comments")
        .send({ body: "This is a comment", author: "butter_bridge" })
        .expect(400)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Bad Request");
          expect(msg).toBe("Invalid ID");
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
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Not Found");
          expect(msg).toBe("Article does not exist");
        });
    });
  });
});
// POST endpoint tests end

// PATCH endpoint tests begin
describe("PATCH: /[Nonexistent Endpoint]", () => {
  describe("405: Method Not Allowed", () => {
    test("Invalid endpoint should respond with not allowed", () => {
      return request(app)
        .patch("/api/doesntexist")
        .expect(405)
        .then(({ body: { error } }) => {
          expect(error).toBe("Method Not Allowed");
        });
    });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  describe("200: Success", () => {
    test("Given a body with the key inc_votes with a POSITIVE value, it should INCREMENT the article's vote count and return the article with the expected vote count", () => {
      return request(app)
        .patch("/api/articles/1/")
        .send({ inc_votes: 11 })
        .expect(200)
        .then(({ body: { article } }) => {
          expect(Object.keys(article).length).toBe(9);
          // prettier-ignore
          expect(article).toMatchObject({
            author:           "butter_bridge",
            title:            "Living in the shadow of a great man",
            article_id:       1,
            body:             "I find this existence challenging",
            topic:            "mitch",
            created_at:       expect.toBeDateString(true),
            comment_count:    11,
            votes:            111,
            article_img_url:  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
          })
          return article;
        });
    });
    test("Given a body with the key inc_votes with a NEGATIVE value, it should DECREMENT the article's vote count and return the article with the expected vote count", () => {
      return request(app)
        .patch("/api/articles/1/")
        .send({ inc_votes: -1 })
        .expect(200)
        .then(({ body: { article } }) => {
          expect(Object.keys(article).length).toBe(9);
          // prettier-ignore
          expect(article).toMatchObject({
            author:           "butter_bridge",
            title:            "Living in the shadow of a great man",
            article_id:       1,
            body:             "I find this existence challenging",
            topic:            "mitch",
            created_at:       expect.toBeDateString(true),
            comment_count:    11,
            votes:            99,
            article_img_url:  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
          })
          return article;
        });
    });
    test("GETTING the article after PATCHING should return the article with the newly updated information", () => {
      return request(app)
        .get("/api/articles/1/")
        .expect(200)
        .then(({ body: { article } }) => {
          return article;
        })
        .then((articleBeforePatch) => {
          return Promise.all([
            articleBeforePatch,
            request(app)
              .patch("/api/articles/1/")
              .send({ inc_votes: 1 })
              .expect(200)
              .then(({ body: { article } }) => {
                return article;
              }),
          ]);
        })

        .then(([articleBeforePatch, patchedArticle]) => {
          return Promise.all([
            articleBeforePatch,
            patchedArticle,
            request(app)
              .get("/api/articles/1/")
              .expect(200)
              .then(({ body: { article } }) => {
                return article;
              }),
          ]);
        })
        .then(([articleBeforePatch, patchedArticle, articleAfterPatch]) => {
          expect(articleBeforePatch).not.toEqual(articleAfterPatch);
          expect(articleAfterPatch).toEqual(patchedArticle);
        });
    });
  });
  describe("400: Bad Request", () => {
    test("If given a body with invalid keys, it should respond with Bad Request", () => {
      return request(app)
        .patch("/api/articles/1/")
        .send({ increment_votes: 1 })
        .expect(400)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Bad Request");
          expect(msg).toBe("Invalid or missing keys");
        })
        .then(() => {
          return request(app)
            .patch("/api/articles/1/")
            .send({ inc_votes: 1, NewTitle: "New title" })
            .expect(400)
            .then(({ body: { error, msg } }) => {
              expect(error).toBe("Bad Request");
              expect(msg).toBe("Invalid or missing keys");
            });
        });
    });
    test("If given an article with an ID that is not a number, it should respond with Bad Request", () => {
      return request(app)
        .patch("/api/articles/myfavouritearticle/")
        .send({ inc_votes: 1 })
        .expect(400)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Bad Request");
          expect(msg).toBe("Invalid ID");
        });
    });
  });
  describe("404: Not Found", () => {
    test("If given a valid ID for an article that does not exist, it should respond with Not Found", () => {
      return request(app)
        .patch("/api/articles/999/")
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Not Found");
          expect(msg).toBe("Article does not exist");
        });
    });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  describe("200: Success", () => {
    test("Given a body with the key inc_votes with a POSITIVE value, it should INCREMENT the comment's vote count and return the comment with the expected vote count", () => {
      return request(app)
        .patch("/api/comment/1/")
        .send({ inc_votes: 11 })
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(Object.keys(comment).length).toBe(6);
          // prettier-ignore
          expect(comment).toMatchObject({
            comment_id:	  expect.toBeNumber(true),
            article_id:	  expect.toBeNumber(true),
            author:	      expect.toBeString(true),
            body:       	expect.toBeString(true),
            votes:	      27,
            created_at:	  expect.toBeDateString(true)
          });
        });
    });
    test("Given a body with the key inc_votes with a NEGATIVE value, it should DECREMENT the comment's vote count and return the comment with the expected vote count", () => {
      return request(app)
        .patch("/api/comment/1/")
        .send({ inc_votes: -1 })
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(Object.keys(comment).length).toBe(6);
          // prettier-ignore
          expect(comment).toMatchObject({
            comment_id:	  expect.toBeNumber(true),
            article_id:	  expect.toBeNumber(true),
            author:	      expect.toBeString(true),
            body:       	expect.toBeString(true),
            votes:	      15,
            created_at:	  expect.toBeDateString(true)
          });
        });
    });
    test("GETTING the comment after PATCHING should return the comment with the newly updated information", () => {
      return request(app)
        .get("/api/comment/1/")
        .expect(200)
        .then(({ body: { comment } }) => {
          return comment;
        })
        .then((commentBeforePatch) => {
          return Promise.all([
            commentBeforePatch,
            request(app)
              .patch("/api/comment/1/")
              .send({ inc_votes: 1 })
              .expect(200)
              .then(({ body: { comment } }) => {
                return comment;
              }),
          ]);
        })

        .then(([commentBeforePatch, patchedComment]) => {
          return Promise.all([
            commentBeforePatch,
            patchedComment,
            request(app)
              .get("/api/comment/1/")
              .expect(200)
              .then(({ body: { comment } }) => {
                return comment;
              }),
          ]);
        })
        .then(([commentBeforePatch, patchedComment, commentAfterPatch]) => {
          expect(commentBeforePatch).not.toEqual(commentAfterPatch);
          expect(commentAfterPatch).toEqual(patchedComment);
        });
    });
  });
  describe("400: Bad Request", () => {
    test("If given a body with invalid keys, it should respond with Bad Request", () => {
      return request(app)
        .patch("/api/articles/1/")
        .send({ increment_votes: 1 })
        .expect(400)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Bad Request");
          expect(msg).toBe("Invalid or missing keys");
        })
        .then(() => {
          return request(app)
            .patch("/api/articles/1/")
            .send({ inc_votes: 1, NewTitle: "New title" })
            .expect(400)
            .then(({ body: { error, msg } }) => {
              expect(error).toBe("Bad Request");
              expect(msg).toBe("Invalid or missing keys");
            });
        });
    });
    test("If given an article with an ID that is not a number, it should respond with Bad Request", () => {
      return request(app)
        .patch("/api/articles/myfavouritearticle/")
        .send({ inc_votes: 1 })
        .expect(400)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Bad Request");
          expect(msg).toBe("Invalid ID");
        });
    });
  });
  describe("404: Not Found", () => {
    test("If given a valid ID for an article that does not exist, it should respond with Not Found", () => {
      return request(app)
        .patch("/api/articles/999/")
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Not Found");
          expect(msg).toBe("Article does not exist");
        });
    });
  });
});

// PATCH endpoint tests end

// DELETE endpoint tests start
describe("DELETE: /[Nonexistent Endpoint]", () => {
  describe("405: Method Not Allowed", () => {
    test("Invalid endpoint should respond with not allowed", () => {
      return request(app)
        .delete("/api/doesntexist")
        .expect(405)
        .then(({ body: { error } }) => {
          expect(error).toBe("Method Not Allowed");
        });
    });
  });
});

describe("DELETE: /api/comments/:comment_id", () => {
  describe("204: No Content", () => {
    test("should delete an existing comment from the comments table with the matching comment ID", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });
  });
  describe("404: Not Found", () => {
    test("should return not found if the provided comment id is a number but no comment with that id exists", () => {
      return request(app)
        .delete("/api/comments/999")
        .expect(404)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Not Found");
          expect(msg).toBe("Can't delete a comment that does not exist");
        });
    });
  });
  describe("400: Bad Request", () => {
    test("should respond with bad request if the provided comment ID is not a number", () => {
      return request(app)
        .delete("/api/comments/badcomment")
        .expect(400)
        .then(({ body: { error, msg } }) => {
          expect(error).toBe("Bad Request");
          expect(msg).toBe("Invalid ID");
        });
    });
  });
});
