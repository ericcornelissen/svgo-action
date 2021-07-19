import {
  buildParser,
} from "../../../src/parsers/builder";

describe("parsers/builder.ts", () => {
  describe("::buildParser", () => {
    let parseFn;

    beforeAll(() => {
      parseFn = jest.fn();
    });

    beforeEach(() => {
      parseFn.mockReset();
    });

    test("build parser, parse success", () => {
      const parseOutput = { foo: "bar" };
      parseFn.mockReturnValueOnce(parseOutput);

      const parser = buildParser(parseFn);

      const [result, err] = parser("{foo: bar}");
      expect(err).toBeNull();
      expect(result).toEqual(parseOutput);
    });

    test("build parser, parse failure", () => {
      parseFn.mockImplementationOnce(() => { throw new Error("parse error"); });

      const parser = buildParser(parseFn);

      const [, err] = parser("{foo: bar}");
      expect(err).not.toBeNull();
    });
  });
});
