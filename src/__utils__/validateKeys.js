exports.validateKeys = (receivedKeys, expectedKeys, matchAll = true) => {
  return new Promise((resolve, reject) => {
    const receivedKeysClone = receivedKeys.toSorted();
    const expectedKeysClone = expectedKeys.toSorted();
    if (
      matchAll === true &&
      receivedKeysClone.length === expectedKeysClone.length &&
      receivedKeysClone.every((key, i) => key === expectedKeysClone[i])
    ) {
      return resolve("Keys are valid");
    } else if (
      matchAll === false &&
      receivedKeysClone.length > 0 &&
      receivedKeysClone.every((key) => expectedKeys.includes(key))
    ) {
      return resolve("Keys are valid");
    } else
      return reject({
        status: 400,
        error: "Bad Request",
        msg: "Invalid or missing keys",
      });
  });
};
