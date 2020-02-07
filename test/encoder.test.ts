import { decode } from "../src/encoder";


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
