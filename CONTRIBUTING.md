# Contributing to SVGO action

SVGO action welcomes contributions and corrections. Before contributing, please
make sure you read the relevant section in this document. If you decide to
contribute anything, please use the following this workflow:

1. Fork this repository<sup>1</sup>
1. Create a new branch<sup>2</sup> from the latest `develop`
1. Make your changes on the new branch
1. Commit to the new branch and push the commits
1. Make a Pull Request<sup>3</sup>

## Table of Contents

* [New Features](#new-features)
* [Bug Fixes](#bug-fixes)
  * [Bug Reports](#bug-reports)
* [Corrections](#corrections)

## New Features

New features are welcomed, but we want to avoid feature creep. For this reason
we recommend you [open an issue with a feature request] so you don't spend time
working on something that won't be included. Be sure to check if the feature
hasn't been requested before!

Once the feature you want has been approved, you can start implementing it (if
you want to do that). It is advised to indicate you're working on the feature so
others don't start working on the same feature as you do. Also, don't start
working on a feature which someone else is working on. Give everyone a change to
make contributions!

> :warning: If you, for whatever reason, can no longer continue you contribution
> please let us know so others have an opportunity to work on it. If we don't
> hear from you for an extended period of time we may decide to allow others
> to work on the feature you've been assigned to.

When you open a Pull Request that implements a new feature make sure to link to
the relevant feature request and explain how you implemented the feature as
clearly as possible.

## Bug Fixes

Bug fixes are very important. We ask you to **always** open an issue describing
the bug as soon as possible so that we, and others, are aware of the bug. You
can read more about creating [a bug report here](#bug-reports).

You may consider waiting until the bug is confirmed, or you may start working on
a fix immediately if you're 100% sure the bug report is valid. When you open a
Pull Request that fixes the bug make sure to link to the relevant bug report and
explain how you fixed the bug as clearly as possible.

### Bug Reports

If you want to report a bug, please [open an issue with a bug report] and
provide as much details as possible. Consider providing the following
information:

* The version of SVGO Action you're using.
* What is the expected behaviour and what is the actual behaviour.
* A link to the action run where the bug occurs.

To help us diagnose the problem, it is very helpful if you enable debug logging
for Actions<sup>4</sup> in the repository where the bug occurs.

## Corrections

Corrections, be it fixing typos or refactoring code, are valuable contributions
and a good place to start contributing. If you want to improve the documentation
feel free to open a Pull Request with the changes you want to make directly, or
open an issue first if you prefer.

If you want to improve the code base make sure to follow the code style that
is enforced through our [ESLint] configuration. If your improvements can be
enforced through ESLint, please update the ESLint configuration accordingly<sup>
5</sup>. If you need an extra package to be able to enforce your style, feel
free to add it as a `devDependency`.

> :warning: Keep in mind that the maintainers of this project can determine the
> code style of this project as they see fit. That is, your changes may be
> rejected "just because the maintainers don't like it". For this reason, do
> make sure to explain why you think your refactoring changes improve the code.

---

<details>
  <summary>1: Forking a repository.</summary>

  Read more about [forking a repository].
</details>

<details>
  <summary>2: Using branches.</summary>

  Read more about [using branches].
</details>

<details>
  <summary>3: Creating a Pull Request.</summary>

  Read more about [creating a Pull Request].
</details>

<details>
  <summary>4: Enabling debug logging for Actions.</summary>

  To enable debug logging for Actions you must set a secret named
  "ACTIONS_RUNNER_DEBUG" to "true" in the repository where the action is
  running.

  Read more about [enabling debug logging].
</details>

<details>
  <summary>5: Updating the ESLint configuration.</summary>

  You can read more about how configuring ESLint work in their documentation
  (link below). If you're unsure how to configure ESlint you can ask for help
  in the Pull Request with your changes.

  Read more about [configuring ESLint].
</details>

[open an issue with a bug report]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=bug&template=bug_report.md
[open an issue with a feature request]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=enhancement&template=feature_request.md
[eslint]: https://eslint.org/
[forking a repository]: https://help.github.com/en/github/getting-started-with-github/fork-a-repo
[using branches]: https://guides.github.com/introduction/flow/
[creating a pull request]: https://help.github.com/en/desktop/contributing-to-projects/creating-a-pull-request
[enabling debug logging]: https://help.github.com/en/actions/configuring-and-managing-workflows/managing-a-workflow-run#enabling-debug-logging
[configuring ESLint]: https://eslint.org/docs/user-guide/getting-started
