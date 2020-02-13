import contentPayloads from "../fixtures/contents-payloads.json";
import svgs from "../fixtures/svgs.json";

export const decode = jest.fn((data, encoding) => {
    for (const [filename, payload] of Object.entries(contentPayloads)) {
        if (payload.content === data && payload.encoding === encoding) {
            return svgs[filename];
        }
    }
}).mockName("decode");
