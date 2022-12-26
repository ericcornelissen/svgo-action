import type { InputterOptions } from "./types";

const DEFAULT_IGNORE_GLOBS: ReadonlyArray<string> = [];
const DEFAULT_IS_DRY_RUN = false;
const DEFAULT_IS_STRICT_MODE = false;
const DEFAULT_SVGO_V2_CONFIG_PATH = "svgo.config.js";
const DEFAULT_SVGO_VERSION = "2";

const INPUT_NAME_DRY_RUN = "dry-run";
const INPUT_NAME_IGNORE = "ignore";
const INPUT_NAME_STRICT = "strict";
const INPUT_NAME_SVGO_CONFIG = "svgo-config";
const INPUT_NAME_SVGO_VERSION = "svgo-version";

const INPUT_OPTIONS_NOT_REQUIRED: InputterOptions = {
  required: false,
};
const INPUT_OPTIONS_REQUIRED: InputterOptions = {
  required: true,
};

export {
  DEFAULT_IGNORE_GLOBS,
  DEFAULT_IS_DRY_RUN,
  DEFAULT_IS_STRICT_MODE,
  DEFAULT_SVGO_V2_CONFIG_PATH,
  DEFAULT_SVGO_VERSION,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_STRICT,
  INPUT_NAME_SVGO_CONFIG,
  INPUT_NAME_SVGO_VERSION,
  INPUT_OPTIONS_NOT_REQUIRED,
  INPUT_OPTIONS_REQUIRED,
};
