module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],

  ignorePatterns: [
    "node_modules/", // dependencies directory
    "lib/", // TypeScript generated files
  ],

  globals: {
    "jest": "readonly",
  },
  rules: {
    "comma-dangle": ["error", "always-multiline"],
    "object-curly-spacing": ["error", "always"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "_+" }],
  },
  overrides: [
    {
      files: ["**/*.js"],
      globals: {
        "module": "readonly",
        "Promise": "readonly",
        "require": "readonly",
      },
      rules: {
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/no-var-requires": 0,
      },
    },
  ],
};
