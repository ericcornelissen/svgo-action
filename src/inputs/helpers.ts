import {
  DEFAULT_SVGO_V1_CONFIG_PATH,
  DEFAULT_SVGO_V2_CONFIG_PATH,
} from "./constants";

function getDefaultSvgoConfigPath(svgoVersion: number): string {
  if (svgoVersion === 1) {
    return DEFAULT_SVGO_V1_CONFIG_PATH;
  }

  return DEFAULT_SVGO_V2_CONFIG_PATH;
}

export {
  getDefaultSvgoConfigPath,
};
