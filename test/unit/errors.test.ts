import errors from "../../src/errors";

describe("errors.ts", () => {
  describe("::Combine", () => {
    const errNull = null;
    const err0 = "foo";
    const err1 = "bar";

    test("zero errors", async () => {
      const result = errors.Combine();
      expect(result).toBeNull();
    });

    test("one true error", async () => {
      const result = errors.Combine(err0);
      expect(result).not.toBeNull();
      expect(result).toEqual(`${err0}`);
    });

    test("one null error", async () => {
      const result = errors.Combine(errNull);
      expect(result).toBeNull();
    });

    test("multiple true errors", async () => {
      const errs = [
        err0,
        err1,
      ];
      const expected = `${err0},${err1}`;

      const result = errors.Combine(...errs);
      expect(result).not.toBeNull();
      expect(result).toEqual(expected);
    });

    test("multiple null errors", async () => {
      const errs = [errNull, errNull];

      const result = errors.Combine(...errs);
      expect(result).toBeNull();
    });

    test.each([
      [[err0, errNull], `${err0}`],
      [[errNull, err1], `${err1}`],
      [[err0, errNull, err1], `${err0},${err1}`],
    ])("multiple errors (`%p`)", async (errs, expected) => {
      const result = errors.Combine(...errs);
      expect(result).not.toBeNull();
      expect(result).toEqual(expected);
    });
  });

  describe("::New", () => {
    test("create an error", async () => {
      const msg = "foobar";

      const result = errors.New(msg);
      expect(result).not.toBeNull();
      expect(result).toEqual(msg);
    });
  });
});
