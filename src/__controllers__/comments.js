const { selectComments } = require("../__models__/comments");
const { checkArticleExists } = require("../__utils__/checkArticleExists");

exports.getComments = (request, response, next) => {
  const { article_id } = request.params;
  checkArticleExists(article_id)
    .then(() => {
      return selectComments(article_id);
    })
    .then((comments) => {
      if (comments.length === 0) {
        response
          .status(200)
          .send({ comments: "There are no comments on this article." });
      } else response.status(200).send({ comments });
    })
    .catch((error) => next(error));
};
