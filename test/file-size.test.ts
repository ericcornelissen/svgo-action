import { getFileSizeInKB } from "../src/utils/file-size";


describe("::getFileSizeInKb", () => {

  test("an empty file", () => {
    const result = getFileSizeInKB("");
    expect(result).toEqual(0);
  });

  test("a non-empty file", () => {
    const result = getFileSizeInKB("Hello world!");
    expect(result).toEqual(0.012);
  });

});
