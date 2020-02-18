import { decode, encode } from "../src/encoder";


const BASE64 = "base64";
const EMPTY_STRING = "";


describe("::decode", () => {

  describe(`Decoding from ${BASE64}`, () => {

    test.each([
      ["SGVsbG8gd29ybGQh", "Hello world!"],
      ["R3VwcHk=", "Guppy"],
      ["V2h5IG5vdCBab2lkYmVyZw==", "Why not Zoidberg"],
      ["Tm8gdGhpcyBpcyBQYXRyaWNr", "No this is Patrick"],
    ])(`Decode a ${BASE64} string (%s)`, (base64String: string, utf8String: string) => {
      const result: string = decode(base64String, BASE64);
      expect(result).toBe(utf8String);
    });

    test(`decoding an empty ${BASE64} string`, () => {
      const result: string = decode(EMPTY_STRING, BASE64);
      expect(result).toBe(EMPTY_STRING);
    });

  });

  test("throw for unknown encoding", () => {
    expect(() => decode("SGVsbG8gd29ybGQh", "foobar")).toThrow();
  });

});

describe("::encode", () => {

  describe(`Encoding to ${BASE64}`, () => {

    test.each([
      ["Hello world!", "SGVsbG8gd29ybGQh"],
      ["banana for scale", "YmFuYW5hIGZvciBzY2FsZQ=="],
      ["Another one bites de_dust", "QW5vdGhlciBvbmUgYml0ZXMgZGVfZHVzdA=="],
      ["The Spanish Inquisition", "VGhlIFNwYW5pc2ggSW5xdWlzaXRpb24="],
    ])(`Encode a ${BASE64} string (%s)`, (utf8String: string, base64String: string) => {
      const result: string = encode(utf8String, BASE64);
      expect(result).toBe(base64String);
    });

    test(`encoding an empty string to ${BASE64}`, () => {
      const result: string = encode(EMPTY_STRING, BASE64);
      expect(result).toBe(EMPTY_STRING);
    });

  });

  test("throw for unknown encoding", () => {
    expect(() => encode("Hello world!", "foobar")).toThrow();
  });

});
