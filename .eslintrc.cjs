module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "import",
    "jest",
    "mocha",
    "security",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
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
    "indent": ["error", 2],
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
    "@typescript-eslint/no-explicit-any": ["error"],
    "@typescript-eslint/no-unused-vars": ["error", {
      argsIgnorePattern: "_+",
    }],

    // eslint-plugin-import
    // https://github.com/import-js/eslint-plugin-import#rules
    "import/order": ["error", {
      groups: [
        "type",
        "builtin",
        "external",
        "internal",
        ["parent", "sibling"],
        "index",
        "object",
      ],

      "newlines-between": "always",
      "alphabetize": {
        order: "asc",
        caseInsensitive: true,
      },
      warnOnUnassignedImports: true,
      "pathGroups": [
        {
          "pattern": "jest-when",
          "group": "builtin",
          "position": "before",
        },
      ],
      "pathGroupsExcludedImportTypes": [],
    }],

    // eslint-plugin-jest
    // https://github.com/jest-community/eslint-plugin-jest#readme
    "jest/consistent-test-it": ["error", {
      fn: "test",
      withinDescribe: "test",
    }],
    "jest/max-expects": ["error", {
      max: 13,
    }],
    "jest/no-alias-methods": ["error"],
    "jest/no-conditional-in-test": ["error"],
    "jest/no-duplicate-hooks": "off",
    "jest/prefer-comparison-matcher": ["error"],
    "jest/prefer-each": ["error"],
    "jest/prefer-equality-matcher": ["error"],
    "jest/prefer-hooks-in-order": ["error"],
    "jest/prefer-mock-promise-shorthand": ["error"],
    "jest/prefer-to-be": ["error"],
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
    { // Source code only
      files: ["src/**/*.ts"],
      parserOptions: {
        project: "./tsconfig.json",
      },
      rules: {
        "@typescript-eslint/consistent-generic-constructors": [
          "error",
          "type-annotation",
        ],
        "@typescript-eslint/consistent-type-exports": ["error"],
        "@typescript-eslint/consistent-type-imports": ["error"],
        "@typescript-eslint/member-delimiter-style": ["error", {
          multiline: {
            delimiter: "semi",
            requireLast: true,
          },
          singleline: {
            delimiter: "semi",
            requireLast: true,
          },
          multilineDetection: "brackets",
        }],
      },
    },
    { // Configuration files
      files: ["*.cjs"],
      globals: {
        "__dirname": "readonly",
        "module": "readonly",
        "require": "readonly",
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    { // Script files
      files: ["script/**/*.js"],
      rules: {
        "security/detect-non-literal-fs-filename": "off",
      },
    },
    { // Test files
      files: ["test/**/*.ts"],
      rules: {
        "max-len": ["error", {
          ignoreTrailingComments: true,
        }],
        "security/detect-object-injection": "off",
        "security/detect-non-literal-fs-filename": "off",
      },
    },
  ],
};
