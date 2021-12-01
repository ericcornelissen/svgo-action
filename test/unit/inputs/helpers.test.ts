import {
  getDefaultSvgoConfigPath,
} from "../../../src/inputs/helpers";

describe("inputs/helpers.ts", () => {
  describe("::getDefaultSvgoConfigPath", () => {
    test("version 1", () => {
      const result = getDefaultSvgoConfigPath("1");
      expect(result).toBe(".svgo.yml");
    });

    test("version 2", () => {
      const result = getDefaultSvgoConfigPath("2");
      expect(result).toBe("svgo.config.js");
    });
  });
});
