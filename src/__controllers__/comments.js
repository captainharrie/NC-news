const { selectArticleById } = require("../__models__/articles");
const {
  selectComments,
  insertComment,
  dropComment,
  selectCommentById,
  updateComment,
} = require("../__models__/comments");
const { validateKeys } = require("../__utils__/validateKeys");

exports.getComments = (request, response, next) => {
  const { article_id } = request.params;
  selectArticleById(article_id)
    .then(() => {
      return selectComments(article_id);
    })
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch((error) => next(error));
};

exports.getCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  selectCommentById(comment_id).then((comment) => {
    response.status(200).send({ comment });
  });
};

exports.postComment = (request, response, next) => {
  const receivedKeys = Object.keys(request.body);
  const expectedKeys = ["author", "body"];
  validateKeys(receivedKeys, expectedKeys)
    .then(() => {
      const { body, author } = request.body;
      const { article_id } = request.params;
      return insertComment(body, article_id, author);
    })
    .then((comment) => response.status(201).send({ comment }))
    .catch((error) => next(error));
};

exports.deleteComment = (request, response, next) => {
  const { comment_id } = request.params;
  dropComment(comment_id)
    .then(() => response.status(204).send())
    .catch((error) => next(error));
};

exports.patchComment = (request, response, next) => {
  const { comment_id } = request.params;
  const body = request.body;
  const receivedKeys = Object.keys(request.body);
  const allowedKeys = ["inc_votes"];
  return selectCommentById(comment_id)
    .then(() => validateKeys(receivedKeys, allowedKeys, false))
    .then(() => updateComment(comment_id, body))
    .then((updatedComment) =>
      response.status(200).send({ comment: updatedComment })
    )
    .catch((error) => next(error));
};
