import contentPayloads from "../fixtures/contents-payloads.json";
import svgs from "../fixtures/svgs.json";

export const decode = jest.fn((data, encoding) => {
    for (const [filename, payload] of Object.entries(contentPayloads)) {
        if (payload.content === data && payload.encoding === encoding) {
            return svgs[filename];
        }
    }
}).mockName("decode");

export const encode = jest.fn((data, _) => {
    for (const [filename, svg] of Object.entries(svgs)) {
        if (svg === data) {
            return contentPayloads[filename].content;
        }
    }
}).mockName("encode");
