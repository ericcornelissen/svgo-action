module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "mocha",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],

  ignorePatterns: [
    "node_modules/", // dependencies directory
    "lib/", // TypeScript generated files
    "script/", // Utility files
  ],

  globals: {
    "jest": "readonly",
  },
  rules: {
    "comma-dangle": ["error", {
      arrays: "always-multiline",
      objects: "always-multiline",
      imports: "always-multiline",
      exports: "always-multiline",
      functions: "always-multiline",
    }],
    "object-curly-spacing": ["error", "always"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "_+" }],
    "mocha/valid-test-description": ["error", {
      pattern: "^((?![A-Z])).*", // Test description should NOT start with a capital letter
      testNames: ["test"],
    }],
  },
  overrides: [
    {
      // Configuration files
      files: ["*.js"],
      globals: {
        "module": "readonly",
      },
    },
  ],
};
