jest.dontMock("eval");

import parsers from "../../src/parsers";

describe("package parsers", () => {
  describe("::NewJavaScript", () => {
    let parseJavaScript: ReturnType<typeof parsers.NewJavaScript>;

    beforeEach(() => {
      parseJavaScript = parsers.NewJavaScript();
    });

    test("valid JavaScript", () => {
      const [result, err] = parseJavaScript(`
        module.exports = { multipass: true };
      `);

      expect(err).toBeNull();
      expect(result).toEqual({ multipass: true });
    });

    test("invalid JavaScript", () => {
      const [, err] = parseJavaScript(`
        module--exports: { multipass = true };
      `);

      expect(err).not.toBeNull();
    });
  });
});
