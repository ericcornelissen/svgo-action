module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Coverage reporting
  coverageDirectory: "_reports/coverage",
  coveragePathIgnorePatterns: [
    "lib",
    "node_modules",
    "test/mocks",
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 100,
      lines: 80,
    },
  },
};
