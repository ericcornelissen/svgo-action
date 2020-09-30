import contentPayloads from "../fixtures/contents-payloads.json";
import files from "../fixtures/file-data.json";
import optimizations from "../fixtures/optimizations.json";


export const decode = jest.fn()
  .mockImplementation((data, encoding) => {
    for (const [filename, payload] of Object.entries(contentPayloads.files)) {
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
        return contentPayloads.files[filename].content;
      }
    }

    for (const { encoding, optimized } of optimizations) {
      if (optimized === data) {
        return encoding;
      }
    }
  })
  .mockName("encoder.encode");
