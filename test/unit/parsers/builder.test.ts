jest.mock("../../../src/errors");

import {
  buildSafeParser,
} from "../../../src/parsers/builder";

describe("parsers/builder.ts", () => {
  describe("buildSafeParser", () => {
    let parseFn;

    beforeAll(() => {
      parseFn = jest.fn();
    });

    beforeEach(() => {
      parseFn.mockClear();
    });

    test("build parser, parse success", () => {
      const parseOutput = { foo: "bar" };
      parseFn.mockReturnValueOnce(parseOutput);

      const parser = buildSafeParser(parseFn);
      expect(parseFn).not.toHaveBeenCalled();

      const [result, err] = parser("{foo: bar}");
      expect(err).toBeNull();
      expect(parseFn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(parseOutput);
    });

    test("build parser, parse failure", () => {
      const errorMsg = "some message that's probably not in the source code";

      parseFn.mockImplementationOnce(() => {
        throw new Error(errorMsg);
      });

      const parser = buildSafeParser(parseFn);
      expect(parseFn).not.toHaveBeenCalled();

      const [, err] = parser("{foo: bar}");
      expect(err).not.toBeNull();
      expect(err).toContain(errorMsg);
      expect(parseFn).toHaveBeenCalledTimes(1);
    });
  });
});
