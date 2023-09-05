const defaultConfig = {
  ignoreGlobs: {
    provided: true,
    value: [],
  },
  isDryRun: {
    provided: true,
    value: false,
  },
  isStrictMode: {
    provided: true,
    value: false,
  },
  svgoConfigPath: {
    provided: true,
    value: "svgo.config.js",
  },
  svgoVersion: {
    provided: true,
    value: "3",
  },
};

export {
  defaultConfig,
};
