jest.mock("../../../src/errors");
jest.mock("../../../src/parsers");

import errors from "../../../src/errors";
import {
  parseRawSvgoConfig,
} from "../../../src/helpers/svgo-config";
import parsers from "../../../src/parsers";

const parsersNewJavaScript = parsers.NewJavaScript as jest.MockedFunction<typeof parsers.NewJavaScript>; // eslint-disable-line max-len

describe("helpers/svgo-config.ts", () => {
  describe("::parseRawSvgoConfig", () => {
    const rawConfig = "{\"foo\":\"bar\"}";

    const parseOutput = { foo: "bar" };
    const parseError = errors.New("parsing error");

    const baseConfig = {
      svgoConfigPath: { value: "some-file.txt" },
    };

    const successParser = jest.fn()
      .mockReturnValue([parseOutput, null])
      .mockName("successful parser");
    const errorParser = jest.fn()
      .mockReturnValue([parseOutput, parseError])
      .mockName("unsuccessful parser");

    beforeEach(() => {
      successParser.mockClear();
      errorParser.mockClear();
    });

    describe("JavaScript configuration", () => {
      const svgoConfigPaths: string[] = [
        "svgo.config.js",
        "svgo-config.js",
      ];

      beforeEach(() => {
        parsersNewJavaScript.mockClear();
      });

      test.each(svgoConfigPaths)("parse success (%s)", (svgoConfigPath) => {
        const config = Object.assign({ }, baseConfig, {
          svgoConfigPath: { value: svgoConfigPath },
        });

        parsersNewJavaScript.mockReturnValue(successParser);

        const [result, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).toBeNull();
        expect(result).toEqual(parseOutput);

        expect(parsers.NewJavaScript).toHaveBeenCalledTimes(1);
        expect(successParser).toHaveBeenCalledTimes(1);
      });

      test.each(svgoConfigPaths)("parse error (%s)", (svgoConfigPath) => {
        const config = Object.assign({ }, baseConfig, {
          svgoConfigPath: { value: svgoConfigPath },
        });

        parsersNewJavaScript.mockReturnValue(errorParser);

        const [, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).not.toBeNull();

        expect(parsers.NewJavaScript).toHaveBeenCalledTimes(1);
        expect(errorParser).toHaveBeenCalledTimes(1);
      });
    });
  });
});
