const {
  convertTimestampToDate,
  createRef,
  formatComments,
} = require("../db/seeds/utils");
const data = require("../db/data/test-data/");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");

const { validateKeys } = require("../src/__utils__/validateKeys");
const { checkTopicExists } = require("../src/__utils__/checkTopicExists");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createRef", () => {
  test("returns an empty object, when passed an empty array", () => {
    const input = [];
    const actual = createRef(input);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with a single items", () => {
    const input = [{ title: "title1", article_id: 1, name: "name1" }];
    let actual = createRef(input, "title", "article_id");
    let expected = { title1: 1 };
    expect(actual).toEqual(expected);
    actual = createRef(input, "name", "title");
    expected = { name1: "title1" };
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with many items", () => {
    const input = [
      { title: "title1", article_id: 1 },
      { title: "title2", article_id: 2 },
      { title: "title3", article_id: 3 },
    ];
    const actual = createRef(input, "title", "article_id");
    const expected = { title1: 1, title2: 2, title3: 3 };
    expect(actual).toEqual(expected);
  });
  test("does not mutate the input", () => {
    const input = [{ title: "title1", article_id: 1 }];
    const control = [{ title: "title1", article_id: 1 }];
    createRef(input);
    expect(input).toEqual(control);
  });
});

describe("formatComments", () => {
  test("returns an empty array, if passed an empty array", () => {
    const comments = [];
    expect(formatComments(comments, {})).toEqual([]);
    expect(formatComments(comments, {})).not.toBe(comments);
  });
  test("converts created_by key to author", () => {
    const comments = [{ created_by: "ant" }, { created_by: "bee" }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].author).toEqual("ant");
    expect(formattedComments[0].created_by).toBe(undefined);
    expect(formattedComments[1].author).toEqual("bee");
    expect(formattedComments[1].created_by).toBe(undefined);
  });
  test("replaces belongs_to value with appropriate id when passed a reference object", () => {
    const comments = [{ belongs_to: "title1" }, { belongs_to: "title2" }];
    const ref = { title1: 1, title2: 2 };
    const formattedComments = formatComments(comments, ref);
    expect(formattedComments[0].article_id).toBe(1);
    expect(formattedComments[1].article_id).toBe(2);
  });
  test("converts created_at timestamp to a date", () => {
    const timestamp = Date.now();
    const comments = [{ created_at: timestamp }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].created_at).toEqual(new Date(timestamp));
  });
});

describe("validateKeys(recievedKeys, expectedKeys, matchAll)", () => {
  describe("matchAll === true :: if the third argument is not provided, matchAll defaults to true", () => {
    test("should return a resolved promise if the provided keys match the expected keys", () => {
      return expect(
        validateKeys(["key 1", "key 2", "key 3"], ["key 1", "key 2", "key 3"])
      ).resolves.toEqual("Keys are valid");
    });
    test("should return a rejected promise if provided too many keys", () => {
      return expect(
        validateKeys(["key 1", "key 2", "key 3"], ["key 1", "key 2"])
      ).rejects.toEqual({
        status: 400,
        error: "Bad Request",
        msg: "Invalid or missing keys",
      });
    });
    test("should return a rejected promise if provided too few keys", () => {
      return expect(
        validateKeys(["key 1", "key 2"], ["key 1", "key 2", "key 3"])
      ).rejects.toEqual({
        status: 400,
        error: "Bad Request",
        msg: "Invalid or missing keys",
      });
    });
    test("should return a rejected promise if provided keys do not match", () => {
      return expect(
        validateKeys(["key 1", "key 2", "key 4"], ["key 1", "key 2", "key 3"])
      ).rejects.toEqual({
        status: 400,
        error: "Bad Request",
        msg: "Invalid or missing keys",
      });
    });
  });
  describe("matchAll === false", () => {
    test("should return a resolved promise if all the provided keys are in the expected keys array", () => {
      return expect(
        validateKeys(["key 1", "key 2"], ["key 1", "key 2", "key 3"], false)
      ).resolves.toEqual("Keys are valid");
    });
    test("should return a rejected promise if any of the provided keys are not the expected keys array", () => {
      return expect(
        validateKeys(["key 1", "key 4"], ["key 1", "key 2", "key 3"], false)
      ).rejects.toEqual({
        status: 400,
        error: "Bad Request",
        msg: "Invalid or missing keys",
      });
    });

    test("should return a rejected promise if no keys are provided", () => {
      return expect(
        validateKeys([], ["key 1", "key 2", "key 3"], false)
      ).rejects.toEqual({
        status: 400,
        error: "Bad Request",
        msg: "Invalid or missing keys",
      });
    });
  });
});

describe("checkTopic", () => {
  beforeAll(() => {
    return seed(data);
  });

  afterAll(() => {
    return db.end();
  });
  test("should resolve if the topic exists in the topics table", () => {
    return expect(checkTopicExists("mitch")).resolves.toEqual(
      'The topic "mitch" exists'
    );
  });

  test("should reject if the topic does not exist in the topics table", () => {
    return expect(checkTopicExists("cooking")).rejects.toEqual({
      error: "Not Found",
      msg: 'The topic "cooking" does not exist',
      status: 404,
    });
  });
});
