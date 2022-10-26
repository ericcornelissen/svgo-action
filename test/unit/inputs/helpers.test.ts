import {
  getDefaultSvgoConfigPath,
} from "../../../src/inputs/helpers";

describe("inputs/helpers.ts", () => {
  describe("::getDefaultSvgoConfigPath", () => {
    test("version 2", () => {
      const result = getDefaultSvgoConfigPath("2");
      expect(result).toBe("svgo.config.js");
    });

    test("version 3", () => {
      const result = getDefaultSvgoConfigPath("3");
      expect(result).toBe("svgo.config.js");
    });
  });
});
