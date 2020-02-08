import { encode, decode } from "../src/encoder";


describe("::decode", () => {

  describe("Base64", () => {

    const BASE64 = "base64";

    test.each([
      ["SGVsbG8gd29ybGQh", "Hello world!"],
      ["R3VwcHk=", "Guppy"],
      ["V2h5IG5vdCBab2lkYmVyZw==", "Why not Zoidberg"],
      ["Tm8gdGhpcyBpcyBQYXRyaWNr", "No this is Patrick"],
    ])("Decode a base64 string (%s)", (base64String: string, utf8String: string) => {
      const result: string = decode(base64String, BASE64);
      expect(result).toBe(utf8String);
    });

    test("Decoding an empty base64 string", () => {
      const emptyString = "";

      const result: string = decode(emptyString, BASE64);
      expect(result).toBe(emptyString);
    });

  });

  test("throw for unknown encoding", () => {
    expect(() => decode("SGVsbG8gd29ybGQh", "foobar")).toThrow();
  });

});

describe("::encode", () => {

  describe("Base64", () => {

    const BASE64 = "base64";

    test.each([
      ["Hello world!", "SGVsbG8gd29ybGQh"],
      ["banana for scale", "YmFuYW5hIGZvciBzY2FsZQ=="],
      ["Another one bites de_dust", "QW5vdGhlciBvbmUgYml0ZXMgZGVfZHVzdA=="],
      ["The Spanish Inquisition", "VGhlIFNwYW5pc2ggSW5xdWlzaXRpb24="],
    ])("Encode a base64 string (%s)", (utf8String: string, base64String: string) => {
      const result: string = encode(utf8String, BASE64);
      expect(result).toBe(base64String);
    });

    test("Encoding an empty string to base64", () => {
      const emptyString = "";

      const result: string = encode(emptyString, BASE64);
      expect(result).toBe(emptyString);
    });

  });

  test("throw for unknown encoding", () => {
    expect(() => encode("Hello world!", "foobar")).toThrow();
  });

});
