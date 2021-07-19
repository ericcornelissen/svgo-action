module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "_reports/coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
  ],
  coveragePathIgnorePatterns: [
    "lib",
    "node_modules",
    "test/mocks",
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
    },
  },
};
