import { encode, decode } from "../src/encoder";


describe("::decode", () => {

  describe("Base64", () => {

    test.each([
      ["SGVsbG8gd29ybGQh", "Hello world!"],
      ["R3VwcHk=", "Guppy"],
      ["V2h5IG5vdCBab2lkYmVyZw==", "Why not Zoidberg"],
      ["Tm8gdGhpcyBpcyBQYXRyaWNr", "No this is Patrick"],
    ])("Decode a base64 string (%s)", (base64String: string, utf8String: string) => {
      const result: string = decode(base64String, "base64");
      expect(result).toBe(utf8String);
    });

  });

});

describe("::encode", () => {

  describe("Base64", () => {

    test.each([
      ["Hello world!", "SGVsbG8gd29ybGQh"],
      ["banana for scale", "YmFuYW5hIGZvciBzY2FsZQ=="],
      ["Another one bites de_dust", "QW5vdGhlciBvbmUgYml0ZXMgZGVfZHVzdA=="],
      ["The Spanish Inquisition", "VGhlIFNwYW5pc2ggSW5xdWlzaXRpb24="],
    ])("Encode a base64 string (%s)", (utf8String: string, base64String: string) => {
      const result: string = encode(utf8String, "base64");
      expect(result).toBe(base64String);
    });

  });

});
