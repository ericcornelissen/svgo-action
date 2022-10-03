// Check out jest at: https://jestjs.io/

import process from "node:process";

let coverageSubDir = "all";
if (process.argv.includes("test/integration")) {
  coverageSubDir = "integration";
} else if (process.argv.includes("test/unit")) {
  coverageSubDir = "unit";
}

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  cacheDirectory: "./.cache/jest",
  modulePathIgnorePatterns: [
    "<rootDir>/.temp/.*",
    "<rootDir>/src/.*/__mocks__/.*",
  ],

  coverageDirectory: `_reports/coverage/${coverageSubDir}`,
  collectCoverageFrom: [
    "src/**/*.ts",
  ],
  coveragePathIgnorePatterns: [
    "lib/",
    "node_modules/",
    "test/",
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
    },
  },
};
