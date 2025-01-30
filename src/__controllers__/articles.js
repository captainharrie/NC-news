const {
  selectArticleById,
  selectArticles,
  updateArticle,
} = require("../__models__/articles");
const { checkTopicExists } = require("../__utils__/checkTopicExists");
const { validateKeys } = require("../__utils__/validateKeys");

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  selectArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((error) => next(error));
};

exports.getArticles = async (request, response, next) => {
  try {
    const { sort_by, order, topic } = request.query;
    if (topic) {
      await checkTopicExists(topic);
    }
    await selectArticles(sort_by, order, topic).then((articles) => {
      response.status(200).send({ articles });
    });
  } catch (error) {
    next(error);
  }
};

exports.patchArticle = (request, response, next) => {
  const { article_id } = request.params;
  const body = request.body;
  const receivedKeys = Object.keys(request.body);
  const allowedKeys = ["inc_votes"];
  return selectArticleById(article_id)
    .then(() => validateKeys(receivedKeys, allowedKeys, false))
    .then(() => updateArticle(article_id, body))
    .then((updatedArticle) =>
      response.status(200).send({ article: updatedArticle })
    )
    .catch((error) => next(error));
};
