const { selectTopics } = require("../__models__/topics");

exports.getTopics = (request, response, next) => {
  selectTopics().then((topics) => {
    console.log(topics);
    response.status(200).send({ topics });
  });
};
