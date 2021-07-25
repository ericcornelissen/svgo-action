import New from "../../../src/filters/svgs";

describe("filters/svgs.ts", () => {
  describe("::New", () => {
    let filter;

    beforeEach(() => {
      filter = New();
    });

    test("an svg", () => {
      const result = filter("foo.svg");
      expect(result).toBe(true);
    });

    test("not an svg", () => {
      const result = filter("foo.bar");
      expect(result).toBe(false);
    });
  });
});
