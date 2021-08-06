module.exports = {
  coverageAnalysis: "perTest",
  inPlace: false,
  mutate: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/__mocks__/**/*.ts",
  ],
  commandRunner: {
    command: "npm run test:unit",
  },

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
