module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "jest",
    "mocha",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
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
    // ESLint (https://eslint.org/docs/rules/)
    "arrow-parens": ["error", "always"],
    "comma-dangle": ["error", {
      arrays: "always-multiline",
      objects: "always-multiline",
      imports: "always-multiline",
      exports: "always-multiline",
      functions: "always-multiline",
    }],
    "no-console": ["error"],
    "object-curly-spacing": ["error", "always"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],

    // @typescript-eslint (https://github.com/typescript-eslint/typescript-eslint#readme)
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "_+" }],

    // eslint-plugin-jest (https://github.com/jest-community/eslint-plugin-jest#readme)
    "jest/consistent-test-it": ["error", {
      fn: "test",
      withinDescribe: "test",
    }],
    "jest/no-alias-methods": ["error"],
    "jest/no-duplicate-hooks": "off",
    "jest/no-if": ["error"],
    "jest/no-truthy-falsy": ["error"],
    "jest/prefer-to-be-null": ["error"],
    "jest/prefer-to-be-undefined": ["error"],
    "jest/prefer-to-contain": ["error"],
    "jest/prefer-to-have-length": ["error"],
    "jest/prefer-todo": ["error"],

    // eslint-plugin-mocha (https://github.com/lo1tuma/eslint-plugin-mocha)
    "mocha/valid-test-description": ["error", {
      pattern: "^((?![A-Z])).*", // Test description should NOT start with a capital letter
      testNames: ["test"],
    }],
  },
  overrides: [
    { // Configuration files
      files: ["*.js"],
      globals: {
        "module": "readonly",
      },
    },
  ],
};
