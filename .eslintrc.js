module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "jest",
    "mocha",
    "security",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "plugin:security/recommended",
  ],

  ignorePatterns: [
    "node_modules/", // dependencies directory
    "lib/", // TypeScript generated files
  ],

  globals: {
    "jest": "readonly",
  },
  rules: {
    // ESLint (https://eslint.org/docs/rules/)
    "arrow-parens": ["error", "always"],
    "camelcase": ["error", {
      properties: "never",
      ignoreDestructuring: true,
      ignoreImports: true,
      allow: [
        "base_tree",
        "commit_sha",
        "commits_url",
        "issue_number",
        "per_page",
        "pull_number",
        "pull_request",
      ],
    }],
    "comma-dangle": ["error", {
      arrays: "always-multiline",
      objects: "always-multiline",
      imports: "always-multiline",
      exports: "always-multiline",
      functions: "always-multiline",
    }],
    "max-len": ["error", {
      code: 80,
      comments: 80,
      tabWidth: 2,
      ignoreComments: false,
      ignoreUrls: true,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: false,
      ignoreTrailingComments: true,
    }],
    "no-console": ["error"],
    "object-curly-spacing": ["error", "always"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],

    // @typescript-eslint
    // https://github.com/typescript-eslint/typescript-eslint#readme
    "@typescript-eslint/no-unused-vars": ["error", {
      argsIgnorePattern: "_+",
    }],

    // eslint-plugin-jest
    // https://github.com/jest-community/eslint-plugin-jest#readme
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

    // eslint-plugin-mocha
    // https://github.com/lo1tuma/eslint-plugin-mocha
    "mocha/valid-test-description": ["error", {
      // Test description should NOT start with a capital letter
      pattern: "^((?![A-Z])).*",
      testNames: ["test"],
    }],
  },
  overrides: [
    { // Configuration files
      files: ["*.js"],
      globals: {
        "__dirname": "readonly",
        "module": "readonly",
        "require": "readonly",
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "security/detect-non-literal-fs-filename": "off",
      },
    },
    { // Script files
      files: ["script/**/*.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": ["error", {
          allowArgumentsExplicitlyTypedAsAny: true,
        }],
      },
    },
    { // Test files
      files: ["test/**/*.ts"],
      rules: {
        "max-len": ["error", {
          code: 120,
          ignoreTrailingComments: true,
        }],
        "security/detect-object-injection": "off",
      },
    },
  ],
};
