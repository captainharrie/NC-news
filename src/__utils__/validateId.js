const db = require("../../db/connection");
const { validateKeys } = require("./validateKeys");

exports.validateId = (query) => {
  const receivedKeys = Object.keys(query);
  const expectedKeys = ["table", "column", "id"];
  validateKeys(receivedKeys, expectedKeys);

  return db
    .query(
      `SELECT ${query.column} from ${query.table} WHERE ${query.column} = $1`,
      [query.id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      } else
        return Promise.resolve(
          `${query.column} ${query.id} exists in the table ${query.table}`
        );
    });
};
