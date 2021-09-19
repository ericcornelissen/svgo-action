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
  - [Mutation Testing](#mutation-testing)

> :information_source: If you want to make a contribution to v1 of the Action,
> please refer to the [Contributing Guidelines for v1].

---

## Bug Reports

If you have problems with the _SVGO Action_ or think you've found a bug, please
report it to the developers; we ask you to **always** open an issue describing
the bug as soon as possible so that we, and others, are aware of the bug.

Before reporting a bug, make sure you've actually found a real bug. Carefully
read the documentation and see if it really says you can do what you're trying
to do. If it's not clear whether you should be able to do something or not,
report that too; it's a bug in the documentation! Also, make sure the bug has
not already been reported.

When preparing to report a bug, try to isolate it to a small working example
that reproduces the problem. Once you have this, collect additional information
such as:

- The exact version of SVGO Action you're using.
- A description of the expected behaviour and the actual behaviour.
- All error and warning messages.
- A link to a workflow run where the bug occurs with [debug logging] enabled.

Once you have a precise problem you can report it as a [Bug Report].

## Feature Requests

New features are welcomed, but we want to avoid feature creep. For this reason
we recommend you [open an issue] first so you don't spend time working on
something that won't be included. Be sure to check if the feature hasn't been
requested before.

Once the feature you requested has been approved, you can start implementing it
(if you want to do that). It is advised to indicate you're working on the
feature so others don't start working on the same feature as you do. Also, don't
start working on a feature which someone else is working on. Give everyone a
chance to make contributions.

When you open a Pull Request that implements a new feature make sure to link to
the relevant feature request and explain how you implemented the feature as
clearly as possible.

> :information_source: If you, for whatever reason, can no longer continue your
> contribution please let us know. This gives others an opportunity to work on
> it. If we don't hear from you for an extended period of time we may decide to
> allow others to work on the feature you've been assigned to.

## Corrections

Corrections, be it fixing typos or refactoring code, are valuable contributions.
If you want to improve the documentation in this way feel free to open a Pull
Request with the changes you want to make directly, or [open an issue] first if
you prefer.

If you want to improve the code base make sure to follow the code style that
is enforced through the [ESLint] configuration. If your changes can be enforced
through ESLint, please update the `.eslintrc.js` configuration accordingly. If
you need an extra package to be able to enforce your style please add it as a
`devDependency`.

> :information_source: Keep in mind that the developers of the project determine
> the code style of as they see fit. For this reason, take the time to explain
> why you think your changes improve the project.

## Workflow

If you decide to make a contribution, please do use the following workflow:

- Fork the repository.
- Create a new branch from the latest `main`.
- Make your changes on the new branch.
- Commit to the new branch and push the commit(s).
- Open a Pull Request against `main`.

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
run a command as `npm run [SCRIPT]:[MODIFIER]`, e.g. `npm run test:unit`.

| Scripts            | Modifier      | Description                           |
| :----------------- | :------------ | :------------------------------------ |
| `test`, `coverage` |               | Runs all tests                        |
| `test`, `coverage` | `unit`        | Runs all and only unit tests          |
| `test`, `coverage` | `integration` | Runs all and only integration tests   |
| `test`             | `mutation`    | Runs mutation tests on the unit tests |

Whenever you use the `coverage` variant of a script, a coverage report will be
generated. The report is available in HTML format at
`_reports/coverage/lcov-report/index.html`.

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
