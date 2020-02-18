import contentPayloads from "../fixtures/contents-payloads.json";
import files from "../fixtures/file-data.json";


export const decode = jest.fn()
  .mockImplementation((data, encoding) => {
    for (const [filename, payload] of Object.entries(contentPayloads)) {
      if (payload.content === data && payload.encoding === encoding) {
        return files[filename];
      }
    }
  })
  .mockName("encoder.decode");

export const encode = jest.fn()
  .mockImplementation((data, _) => {
    for (const [filename, svg] of Object.entries(files)) {
      if (svg === data) {
        return contentPayloads[filename].content;
      }
    }
  })
  .mockName("encoder.encode");
