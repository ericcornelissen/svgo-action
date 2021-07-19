import {
  parseJavaScript,
  parseYaml,
} from "../../src/parsers";

describe("package parsers", () => {
  describe("::parseJavaScript", () => {
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

  describe("::parseYaml", () => {
    test("valid YAML", () => {
      const [result, err] = parseYaml(
        "multipass: true\n" +
        "plugins:\n" +
        "  - removeDoctype\n" +
        "",
      );

      expect(err).toBeNull();
      expect(result).toEqual({
        multipass: true,
        plugins: [
          "removeDoctype",
        ],
      });
    });

    test("invalid YAML", () => {
      const [, err] = parseYaml(
        "- removeDoctype\n" +
        "plugins\n" +
        "",
      );

      expect(err).not.toBeNull();
    });
  });
});
