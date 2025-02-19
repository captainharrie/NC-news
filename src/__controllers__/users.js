const { selectUsers, selectUserByID } = require("../__models__/users");

exports.getUsers = (request, response, next) => {
  selectUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((error) => next(error));
};

exports.getUserByID = (request, response, next) => {
  const { username } = request.params;
  selectUserByID(username)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch((error) => next(error));
};
