jest.dontMock("eval");
jest.dontMock("js-yaml");

import parsers from "../../src/parsers";

describe("package parsers", () => {
  describe("::NewJavaScript", () => {
    let parseJavaScript;

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

  describe("::NewYaml", () => {
    let parseYaml;

    beforeEach(() => {
      parseYaml = parsers.NewYaml();
    });

    test("valid YAML", () => {
      const [result, err] = parseYaml([
        "multipass: true",
        "plugins:",
        "  - removeDoctype",
      ].join("\n"));

      expect(err).toBeNull();
      expect(result).toEqual({
        multipass: true,
        plugins: [
          "removeDoctype",
        ],
      });
    });

    test("invalid YAML", () => {
      const [, err] = parseYaml([
        "- removeDoctype",
        "plugins:",
      ].join("\n"));

      expect(err).not.toBeNull();
    });
  });
});
