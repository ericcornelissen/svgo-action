import type { SupportedSvgoVersions } from "../../../src/svgo";

import { mocked } from "ts-jest/utils";

jest.mock("../../../src/errors");
jest.mock("../../../src/parsers");

import errors from "../../../src/errors";
import _parsers from "../../../src/parsers";

import {
  parseRawSvgoConfig,
} from "../../../src/helpers/svgo-config";

const parsers = mocked(_parsers);

describe("helpers/svgo-config.ts", () => {
  describe("::parseRawSvgoConfig", () => {
    const rawConfig = "{\"foo\":\"bar\"}";

    const parseOutput = { foo: "bar" };
    const parseError = errors.New("parsing error");

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

    describe("SVGO version 1", () => {
      const config = {
        svgoConfigPath: { value: ".svgo.yml" },
        svgoVersion: { value: "1" as SupportedSvgoVersions },
      };

      beforeEach(() => {
        parsers.NewYaml.mockClear();
      });

      test("parse success", () => {
        parsers.NewYaml.mockReturnValue(successParser);

        const [result, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).toBeNull();
        expect(result).toEqual(parseOutput);

        expect(parsers.NewYaml).toHaveBeenCalledTimes(1);
        expect(successParser).toHaveBeenCalledTimes(1);
      });

      test("parse error", () => {
        parsers.NewYaml.mockReturnValue(errorParser);

        const [, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).not.toBeNull();

        expect(parsers.NewYaml).toHaveBeenCalledTimes(1);
        expect(errorParser).toHaveBeenCalledTimes(1);
      });
    });

    describe("SVGO version 2", () => {
      const config = {
        svgoConfigPath: { value: "svgo.yml" },
        svgoVersion: { value: "2" as SupportedSvgoVersions },
      };

      beforeEach(() => {
        parsers.NewJavaScript.mockClear();
      });

      test("parse success", () => {
        parsers.NewJavaScript.mockReturnValue(successParser);

        const [result, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).toBeNull();
        expect(result).toEqual(parseOutput);

        expect(parsers.NewJavaScript).toHaveBeenCalledTimes(1);
        expect(successParser).toHaveBeenCalledTimes(1);
      });

      test("parse error", () => {
        parsers.NewJavaScript.mockReturnValue(errorParser);

        const [, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).not.toBeNull();

        expect(parsers.NewJavaScript).toHaveBeenCalledTimes(1);
        expect(errorParser).toHaveBeenCalledTimes(1);
      });
    });

    describe("SVGO version 'project'", () => {
      const baseConfig = {
        svgoConfigPath: { value: "svgo.config.js" },
        svgoVersion: { value: "project" as SupportedSvgoVersions },
      };

      describe("YAML configuration", () => {
        const svgoConfigPaths: string[] = [
          ".svgo.yml",
          "svgo.yaml",
        ];

        beforeEach(() => {
          parsers.NewYaml.mockClear();
        });

        test.each(svgoConfigPaths)("parse success (%s)", (svgoConfigPath) => {
          const config = Object.assign({ }, baseConfig, {
            svgoConfigPath: { value: svgoConfigPath },
          });

          parsers.NewYaml.mockReturnValue(successParser);

          const [result, err] = parseRawSvgoConfig({ config, rawConfig });
          expect(err).toBeNull();
          expect(result).toEqual(parseOutput);

          expect(parsers.NewYaml).toHaveBeenCalledTimes(1);
          expect(successParser).toHaveBeenCalledTimes(1);
        });

        test.each(svgoConfigPaths)("parse error (%s)", (svgoConfigPath) => {
          const config = Object.assign({ }, baseConfig, {
            svgoConfigPath: { value: svgoConfigPath },
          });

          parsers.NewYaml.mockReturnValue(errorParser);

          const [, err] = parseRawSvgoConfig({ config, rawConfig });
          expect(err).not.toBeNull();

          expect(parsers.NewYaml).toHaveBeenCalledTimes(1);
          expect(errorParser).toHaveBeenCalledTimes(1);
        });
      });

      describe("JavaScript configuration", () => {
        const svgoConfigPaths: string[] = [
          "svgo.config.js",
          "svgo-config.js",
        ];

        beforeEach(() => {
          parsers.NewJavaScript.mockClear();
        });

        test.each(svgoConfigPaths)("parse success (%s)", (svgoConfigPath) => {
          const config = Object.assign({ }, baseConfig, {
            svgoConfigPath: { value: svgoConfigPath },
          });

          parsers.NewJavaScript.mockReturnValue(successParser);

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

          parsers.NewJavaScript.mockReturnValue(errorParser);

          const [, err] = parseRawSvgoConfig({ config, rawConfig });
          expect(err).not.toBeNull();

          expect(parsers.NewJavaScript).toHaveBeenCalledTimes(1);
          expect(errorParser).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
