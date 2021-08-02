# Contributing Guidelines

The _SVGO Action_ project welcomes contributions and corrections of all forms.
For v1 this includes improvements to the documentation, new tests, and bug
fixes. We recommend you [open an issue] before making any significant changes so
you can be sure your work won't be rejected. For changes such as fixing a typo
you can open a Pull Request directly.

If you plan to make a contribution, please do make sure to read through the
relevant sections of this document.

- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Corrections](#corrections)
- [Workflow](#workflow)
- [Project Setup](#project-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)

> :information_source: This document covers contributing to v1 of the Action. If
> you want to make a contribution to the latest version of the Action check out
> the [Contributing Guidelines on `main`].

---

## Bug Reports

> :warning: Support for bug fixes in SVGO Action v1 ends on 2022-05-31. Bugs
> reported after that date have no guarantee of being fixed.

If you have problems with _SVGO Action_ or think you've found a bug, please
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

- The version of SVGO Action you're using.
- A description of the expected behaviour and the actual behaviour.
- Error and/or warning messages.
- A link to an action run where the bug occurs with [debug logging] enabled.

Once you have a precise problem you can report it as a [Bug Report].

## Feature Requests

No new features will be added to v1 going forward.

## Corrections

Corrections such as fixing typos are valuable contributions and a good place to
start contributing. If you want to improve the documentation in this way feel
free to open a Pull Request with the changes you want to make directly, or [open
an issue] first if you prefer.

## Workflow

If you decide to make a contribution, please do use the following workflow:

- Fork the repository.
- Create a new branch from the latest `main-v1`.
- Make your changes on the new branch.
- Commit to the new branch and push the commit(s).
- Open a Pull Request against `main-v1`.

## Project Setup

To be able to contribute you need at least the following:

- _Git_;
- _NodeJS_ v14 or lower and _NPM_ v6 or lower;
- (Recommended) a code editor with _[EditorConfig]_ support;

We use [Husky] to automatically install git hooks. Please enable it when
contributing to _SVGO Action_.

## Making Changes

Before you start making changes, be sure to run `npm install`.

When making changes it is important that 1) your changes are properly formatted
and 2) your changes are properly tested if it is a code change. The former can
be achieved with the `npm run format` command. The latter requires you to add
new test cases to the project, you can use `npm run test` to verify the new (and
old) tests pass. `npm run test:coverage` is available to run tests and generate
a coverage report. The report is available in HTML format at
`_reports/coverage/lcov-report/index.html`.

## Testing

It is important to test any changes and equally important to add tests for
previously untested code. Tests for this project are written using [Jest] and
[Sinon]. All tests go directly into the `test/` folders and all test files
should follow the naming convention `[FILENAME].test.ts`.

[bug report]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=bug&template=bug_report.md
[contributing guidelines on `main`]: https://github.com/ericcornelissen/svgo-action/blob/main/CONTRIBUTING.md
[debug logging]: https://docs.github.com/en/actions/managing-workflow-runs/enabling-debug-logging
[editorconfig]: https://editorconfig.org/
[husky]: https://typicode.github.io/husky/#/
[jest]: https://jestjs.io/
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new/choose
[sinon]: https://sinonjs.org/
