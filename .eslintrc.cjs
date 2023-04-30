// Check out ESLint at: https://eslint.org/

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
    "key-spacing": "off", // Use `@typescript-eslint/key-spacing` instead
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
    "@typescript-eslint/key-spacing": "error",
    "@typescript-eslint/no-explicit-any": ["error"],
    "@typescript-eslint/no-unused-vars": ["error", {
      argsIgnorePattern: "_+",
    }],

    // eslint-plugin-import
    // https://github.com/import-js/eslint-plugin-import#rules
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
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
    "import/no-empty-named-blocks": ["error"],

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
      files: [
        "src/**/*.ts",
        "**/*.md/*.ts",
      ],
      parserOptions: {
        project: "./tsconfig.json",
      },
      rules: {
        "@typescript-eslint/block-spacing": ["error"],
        "@typescript-eslint/consistent-generic-constructors": [
          "error",
          "type-annotation",
        ],
        "@typescript-eslint/consistent-type-exports": ["error"],
        "@typescript-eslint/consistent-type-imports": ["error"],
        "@typescript-eslint/key-spacing": ["error"],
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
        "@typescript-eslint/no-duplicate-type-constituents": ["error", {
          ignoreIntersections: false,
          ignoreUnions: false,
        }],
        "@typescript-eslint/no-unsafe-enum-comparison": ["error"],
        "@typescript-eslint/switch-exhaustiveness-check": ["error"],

        "block-spacing": "off", // use @typescript-eslint/block-spacing instead
        "key-spacing": "off", // use @typescript-eslint/key-spacing instead
      },
    },
    { // Configuration files (JavaScript)
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
    { // Configuration files (JSON)
      files: [
        ".github/renovate.json",
        "*.json",
        "**/*.md/*.json",
      ],
      plugins: [
        "json",
      ],
      rules: {
        "json/*": ["error"],
      },
    },
    { // Configuration files (YAML)
      files: [
        ".github/**/*.yml",
        "*.yml",
        "**/*.md/*.yml",
      ],
      extends: [
        "plugin:yml/standard",
      ],
      rules: {
        // ESLint (https://eslint.org/docs/rules/)
        "max-len": "off",
        "spaced-comment": "off", // Per https://ota-meshi.github.io/eslint-plugin-yml/rules/spaced-comment.html

        // eslint-plugin-yml
        // https://ota-meshi.github.io/eslint-plugin-yml/rules/
        "yml/block-mapping": ["error", "always"],
        "yml/block-mapping-colon-indicator-newline": ["error", "never"],
        "yml/block-mapping-question-indicator-newline": ["error", "never"],
        "yml/block-sequence": ["error", "always"],
        "yml/block-sequence-hyphen-indicator-newline": ["error", "never"],
        "yml/file-extension": ["error", {
          extension: "yml",
          caseSensitive: true,
        }],
        "yml/indent": ["error", 2, {
          indentBlockSequences: true,
          indicatorValueIndent: 2,
        }],
        "yml/key-name-casing": "off",
        "yml/key-spacing": ["error", {
          afterColon: true,
          beforeColon: false,
          mode: "strict",
        }],
        "yml/no-empty-document": "error",
        "yml/no-empty-key": "error",
        "yml/no-empty-mapping-value": "error",
        "yml/no-empty-sequence-entry": "error",
        "yml/no-irregular-whitespace": "error",
        "yml/no-multiple-empty-lines": ["error", {
          max: 1,
          maxEOF: 0,
          maxBOF: 0,
        }],
        "yml/no-tab-indent": "error",
        "yml/plain-scalar": ["error", "always"],
        "yml/quotes": ["error", {
          avoidEscape: true,
          prefer: "double",
        }],
        "yml/require-string-key": "error",
        "yml/sort-keys": "off",
        "yml/sort-sequence-values": "off",
        "yml/spaced-comment": ["error", "always"],
        "yml/vue-custom-block/no-parsing-error": "off",
      },
    },
    { // Script files
      files: [
        "script/**/*.js",
        "**/*.md/*.js",
      ],
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
    { // Documentation (MarkDown)
      files: [
        "**/*.md",
      ],
      plugins: [
        "markdown",
      ],
      processor: "markdown/markdown",
    },
  ],
  ignorePatterns: [
    "node_modules/",
    ".idea/",
    ".npm/",
    ".vscode/",

    // Generated & temporary
    ".cache/",
    ".temp/",
    "_reports/",
    "lib/",

    // Don't ignore configuration files
    "!.github/",
    "!.*.cjs",
    "!.*.js",
    "!.*.json",
    "!.*.yml",
  ],
};
