// Check out Stryker at: https://stryker-mutator.io/

export default {
  coverageAnalysis: "perTest",
  inPlace: false,
  mutate: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/**/*.d.ts",
    "!src/**/__mocks__/**/*.ts",
  ],

  testRunner: "jest",
  testRunnerNodeArgs: ["--experimental-vm-modules"],
  jest: {
    projectType: "custom",
    configFile: "jest.config.cjs",
    config: {
      testMatch: ["<rootDir>/test/unit/**/*.test.ts"],
    },
  },

  incremental: true,
  incrementalFile: ".cache/stryker/incremental.json",

  timeoutMS: 25000,
  timeoutFactor: 2.5,

  disableTypeChecks: "{src,test}/**/*.ts",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",

  reporters: [
    "clear-text",
    "dashboard",
    "html",
    "progress",
  ],
  htmlReporter: {
    fileName: "_reports/mutation/index.html",
  },
  thresholds: {
    break: 95,
    high: 95,
    low: 85,
  },

  tempDirName: ".temp/stryker",
  cleanTempDir: false,
};
