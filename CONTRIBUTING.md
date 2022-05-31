# Contributing Guidelines

The _SVGO Action_ project welcomes contributions and corrections of all forms.
This includes improvements to the documentation or code base, new tests, bug
fixes, and implementations of new features. We recommend you [open an issue]
before making any substantial changes so you can be sure your work won't be
rejected. But for changes such as fixing a typo you can open a Pull Request
directly.

If you plan to make a contribution, please do make sure to read through the
relevant sections of this document.

- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Corrections](#corrections)
- [Workflow](#workflow)
- [Project Setup](#project-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
  - [Mocking](#mocking)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [End-to-End Tests](#end-to-end-tests)
  - [Mutation Testing](#mutation-testing)

> :information_source: This document covers contributing to v2 of the Action. If
> you want to make a contribution to the latest version of the Action check out
> the [Contributing Guidelines on `main`]. If you want to make a contribution to
> v1 of the Action, please refer to the [Contributing Guidelines for v1].

---

## Bug Reports

No bug fixes will be provided nor accepted for v2 of the SVGO Action going
forward, unless the bug has an impact on the security of the Action.

## Feature Requests

No new features will be added to v2 of the SVGO Action going forward.

## Corrections

Corrections (such as fixing typos) for v2 of the SVGO Action will not be
provided but may be accepted when contributed, if the changes are trivial.

## Workflow

If you decide to make a contribution, please do use the following workflow:

- Fork the repository.
- Create a new branch from the latest `main-v2`.
- Make your changes on the new branch.
- Commit to the new branch and push the commit(s).
- Open a Pull Request against `main-v2`.

## Project Setup

To be able to contribute you need at least the following:

- _Git_;
- _NodeJS_ v16 or higher and _NPM_ v7 or higher;
- (Recommended) a code editor with _[EditorConfig]_ support;

We use [Husky] to automatically install git hooks. Please enable it when
contributing to _SVGO Action_.

## Making Changes

Before you start making changes you should run `npm install`. This ensures your
local development environment is setup and ready to go.

When making changes it is important that 1) your changes are properly formatted
and 2) your changes are properly tested (if it is a code change). The former can
be achieved with the `npm run format` command. The latter requires you to add
new test cases to the project, you can use `npm run test` to verify the new (and
old) tests pass. Read on to understand how testing is done in this project.

## Testing

It is important to test any changes and equally important to add tests for
previously untested code. Tests for this project are written using [Jest] and
[Sinon]. All tests go into the `test/` folders and all test files should follow
the naming convention `[FILENAME].test.ts`.

The tests for _SVGO Action_ are split between unit and integration test. Various
commands are available to run the tests, as shown in the overview below. You can
run a command as `npm run [SCRIPT]:[MODIFIER]`, e.g. `npm run test` or
`npm run coverage:unit`.

| Scripts            | Modifier           | Description            |
| :----------------- | :----------------- | :--------------------- |
| `test`, `coverage` | `all` _(optional)_ | Runs all tests         |
| `test`, `coverage` | `unit`             | Runs unit tests        |
| `test`, `coverage` | `integration`      | Runs integration tests |
| `test`             | `mutation`         | Runs mutation tests    |

Whenever you use the `coverage` variant of a script, a coverage report will be
generated. The report is available in HTML format at
`_reports/coverage/[MODIFIER]/lcov-report/index.html`.

### Mocking

We make extensive use of [mocking]. A mock for a particular file goes into the
`__mocks__` folder in the folder of that file. The name of a mock file should
always match the name of the file it mocks.

Mocks for node modules go into the `__mocks__` directory at the root of the
project. The name of the mock file should always match the name of the node
module. In the case of a scoped node module, the mock file should be placed in a
folders with the name of the scope. For example, the mock for `@actions/core`
can be found at `__mocks__/@actions/core.ts`.

Any non-mock module inside a `__mocks__` folder should follow the naming
convention `__[FILENAME]__.ts`. Any mock that is not tied to a file or node
module should be placed in the `test/__common__` folder and follow the naming
convention `[FILENAME].mock.ts`.

### Unit Tests

All unit tests go into the `test/unit` folder, which mimics the structure of the
`src/` folder. A unit test suite should cover one and only one file. For
examples of how to achieve this you can study existing unit tests. To check that
a unit test does not rely on any other code you can run the following command
and check the resulting coverage report.

```shell
npm run coverage -- test/unit/[PATH TO FILE]
```

### Integration Tests

All integrations tests go into the `test/integration` folder. An integration
test suite aims to verify that different units work together correctly. As such,
while an integration test should still focus on one thing, it is generally not
necessary to mock anything (exceptions include file system operations and
network communication).

### End-to-End Tests

The end-to-end tests are defined in the `test-e2e` job in the GitHub Actions
workflow file `push-checks.yml`. The test operate with and on the fixtures found
in `test/end-to-end`. During end-to-end testing, the Action is run as if it was
triggered by a `schedule` event.

The end-to-end tests verify three things:

1. That the source code (in `src/`, not `lib/`) can be run as an Action,
1. That the Action outputs are correct, and
1. That SVGs are modified on disk.

Due to the nature of these tests they cannot be run locally. It is generally not
necessary to add new end-to-end tests when you make a contribution.

### Mutation Testing

We make use of [Mutation Testing] to improve the quality of unit tests. We use
the mutation testing framework [StrykerJS]. By default the mutation tests run on
all the source code using all the unit tests. After running the mutation tests,
a mutation report is available in HTML format at `_reports/mutation/index.html`.

You can change the mutation test configuration (in `stryker.config.js`) to focus
on a subset of the source code or unit tests (we ask that you don't commit such
changes). For example, to run mutation tests for a particular file you can
change the Stryker configuration as follows.

```diff
  mutate: [
-   "src/**/*.ts",
+   "src/path/to/file.ts",
    "!src/**/*.d.ts",
    "!src/**/__mocks__/**/*.ts",
  ],
  commandRunner: {
-   command: "npm run test:unit -- --runInBand",
+   command: "npm run test -- --runInBand test/unit/path/to/file.test.ts",
  },
```

[bug report]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=bug&template=bug_report.md
[contributing guidelines on `main`]: https://github.com/ericcornelissen/svgo-action/blob/main/CONTRIBUTING.md
[contributing guidelines for v1]: https://github.com/ericcornelissen/svgo-action/blob/main-v1/CONTRIBUTING.md
[debug logging]: https://docs.github.com/en/actions/managing-workflow-runs/enabling-debug-logging
[editorconfig]: https://editorconfig.org/
[eslint]: https://eslint.org/
[husky]: https://typicode.github.io/husky/#/
[jest]: https://jestjs.io/
[mocking]: https://stackoverflow.com/a/2666006
[mutation testing]: https://en.wikipedia.org/wiki/Mutation_testing
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new/choose
[sinon]: https://sinonjs.org/
[strykerjs]: https://stryker-mutator.io/
