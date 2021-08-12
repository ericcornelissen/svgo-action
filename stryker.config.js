module.exports = {
  coverageAnalysis: "perTest",
  inPlace: false,
  mutate: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/__mocks__/**/*.ts",
  ],
  commandRunner: {
    command: "npm run test:unit -- --runInBand --bail",
  },

  timeoutMS: 1000,
  timeoutFactor: 2.5,

  disableTypeChecks: "{src,test}/**/*.ts",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",

  reporters: [
    "clear-text",
    "html",
    "progress",
  ],
  htmlReporter: {
    baseDir: "_reports/mutation",
  },
  thresholds: {
    high: 80,
    low: 70,
    break: 50,
  },

  tempDirName: ".temp",
  cleanTempDir: false,
};
