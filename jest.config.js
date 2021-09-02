module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  cacheDirectory: "./.cache/jest",
  modulePathIgnorePatterns: [
    "<rootDir>/.temp/.*",
    "<rootDir>/src/.*/__mocks__/.*",
  ],

  // Coverage reporting
  coverageDirectory: "_reports/coverage",
  coveragePathIgnorePatterns: [
    "lib",
    "node_modules",
    "test",
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 100,
      lines: 80,
    },
  },
};
