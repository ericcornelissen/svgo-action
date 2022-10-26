# SVGO Action

[![Build status][ci-image]][ci-url]
[![Coverage Report][coverage-image]][coverage-url]
[![Mutation Report][mutation-image]][mutation-url]
[![Snyk Status][snyk-image]][snyk-url]

Automatically run [SVGO] with GitHub Actions.

## Usage

### Install the Action

Create a Workflow file (e.g.: `.github/workflows/optimize.yml`, see [Creating a
Workflow file]) with the workflow below - or check out the [examples] for
various complete workflows. You can also check [what the Action does for each
`on` event] and [what the Action outputs] for subsequent steps.

```yaml
name: Optimize
on:
# Comment the next line if you *don't* want the Action to run on Pull Requests.
  pull_request:
# Uncomment the next line if you want the Action to run on pushes.
#   push:
# Uncomment the next 2 lines if you want the Action to run on a schedule.
#   schedule:
#   - cron:  '0 * * * 1'  # See https://crontab.guru/
# Uncomment one of the next 2 lines if you want to manually trigger the Action.
#   repository_dispatch:
#   workflow_dispatch:

jobs:
  svgs:
    name: SVGs
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    # Uncomment the next 2 lines to select a branch for on schedule or dispatch.
    #   with:
    #     ref: main
    - uses: ericcornelissen/svgo-action@v3
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```

_Note: This grants access to the `GITHUB_TOKEN` so the Action can make calls to
GitHub's rest API. This is only needed for `pull_request` and `push` events._

### Configure the Action

The following inputs are available when using the SVGO Action. More details can
be found in the [inputs documentation].

```yaml
- uses: ericcornelissen/svgo-action@v3
  with:
    # Prevent the Action from writing changes.
    #
    # Default: `false`
    dry-run: true

    # Globs of SVGs that should be ignored.
    #
    # Default: ""
    ignore: |
      vendor/**/

    # A GitHub token (`${{ secrets.GITHUB_TOKEN }}`), required when running on
    # pushes or Pull Requests.
    #
    # Default: ""
    repo-token: ${{ secrets.GITHUB_TOKEN }}

    # Fail on non-critical errors.
    #
    # Default: false
    strict: true

    # The path of the SVGO configuration file.
    #
    # Default: "svgo.config.js"
    svgo-config: path/to/svgo-config.js

    # The version of SVGO to use for optimizing.
    #
    # Default: 2
    svgo-version: 3
```

### Advanced Usage

#### Limit Runs

Even though this Action won't do anything if a push or Pull Request does not
touch any SVGs, you may want the Action to run only when an SVG has actually
changed. To do this you can change the Workflow file that uses this Action to be
triggered only when SVGs change. Update the value of `pull_request` and/or
`push` as follows:

> **Warning** This will cause the entire Workflow to be run only when an SVG
> changes. Jobs that should run for every push or Pull Request must be specified
> in a separate Workflow file.

```yaml
on:
  pull_request:
    paths:
    - "**.svg"
  push:
    paths:
    - "**.svg"
```

#### Token Permissions

The minimum required [permissions] needed to run this Action are:

```yaml
permissions:
  contents: read
  # Uncomment the next line if you're using the Action on Pull Requests
  #   pull-requests: read

# Or use `read-all` to allow reading in all scopes (recommended for open source)
permissions: read-all
```

[ci-url]: https://github.com/ericcornelissen/svgo-action/actions/workflows/check.yml
[ci-image]: https://github.com/ericcornelissen/svgo-action/actions/workflows/check.yml/badge.svg
[coverage-url]: https://codecov.io/gh/ericcornelissen/svgo-action
[coverage-image]: https://codecov.io/gh/ericcornelissen/svgo-action/branch/main/graph/badge.svg
[mutation-url]: https://dashboard.stryker-mutator.io/reports/github.com/ericcornelissen/svgo-action/main
[mutation-image]: https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fericcornelissen%2Fsvgo-action%2Fmain
[snyk-image]: https://snyk.io/test/github/ericcornelissen/svgo-action/badge.svg?targetFile=package.json
[snyk-url]: https://snyk.io/test/github/ericcornelissen/svgo-action?targetFile=package.json

[creating a workflow file]: https://docs.github.com/en/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow
[permissions]: https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#permissions
[svgo]: https://github.com/svg/svgo
[examples]: ./docs/examples.md
[inputs documentation]: ./docs/inputs.md
[what the action does for each `on` event]: ./docs/events.md
[what the action outputs]: ./docs/outputs.md
