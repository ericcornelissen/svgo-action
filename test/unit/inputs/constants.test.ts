import {
  INPUT_OPTIONS_NOT_REQUIRED,
  INPUT_OPTIONS_REQUIRED,
} from "../../../src/inputs/constants";

describe("inputs/constants.ts", () => {
  test("input option required object", () => {
    expect(INPUT_OPTIONS_REQUIRED).toHaveProperty("required");
    expect(INPUT_OPTIONS_REQUIRED.required).toBe(true);
  });

  test("input option not required object", () => {
    expect(INPUT_OPTIONS_NOT_REQUIRED).toHaveProperty("required");
    expect(INPUT_OPTIONS_NOT_REQUIRED.required).toBe(false);
  });
});
