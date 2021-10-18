# SVGO Action

[![Build status][ci-image]][ci-url]
[![Coverage Report][coverage-image]][coverage-url]
[![Maintainability][maintainability-image]][maintainability-url]
[![Snyk Status][snyk-image]][snyk-url]
[![FOSSA Status][fossa-image]][fossa-url]

Automatically run [SVGO] with GitHub Actions.

## Usage

### Install the Action

Create a Workflow file (e.g.: `.github/workflows/optimize.yml`, see [Creating a
Workflow file]) with the workflow below - or check out [the examples] for
various complete workflows. You can also check [what the Action does for each
`on` event] and [what the Action outputs] for subsequent steps.

```yaml
name: Optimize
on:
# Disable the next line if you don't want the Action to run on PRs.
  pull_request:
# Enable the next line if you want the Action to run on pushes.
#   push:
# Enable the next 2 lines if you want the Action to run on a schedule.
#   schedule:
#   - cron:  '0 * * * 1'  # See https://crontab.guru/
# Enable one of the next 2 lines if you want to manually trigger the Action.
#   repository_dispatch:
#   workflow_dispatch:

jobs:
  svgs:
    name: SVGs
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    # Enable the next 2 lines to select a branch for schedule or dispatch runs.
    #   with:
    #     ref: main
    - uses: ericcornelissen/svgo-action@v2
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```

_Note: This grants access to the `GITHUB_TOKEN` so the Action can make calls to
GitHub's rest API. This is only needed for `pull_request` and `push` events._

### Configure the Action

The following inputs are available when using the SVGO Action.

| Name           | Description                               | Default            | Documentation                             |
| -------------- | ----------------------------------------- | ------------------ | ----------------------------------------- |
| `dry-run`      | Prevent the Action from writing changes   | `false`            | [docs](./docs/inputs.md#dry-run)          |
| `ignore`       | [glob]s of SVGs that should be ignored    | `""`               | [docs](./docs/inputs.md#ignore)           |
| `repo-token`   | A GitHub token (`secrets.GITHUB_TOKEN`)   | `""`               | [docs](./docs/inputs.md#repository-token) |
| `strict`       | Fail on non-critical errors               | `false`            | [docs](./docs/inputs.md#strict-mode)      |
| `svgo-config`  | The path of the [SVGO] configuration file | `"svgo.config.js"` | [docs](./docs/inputs.md#svgo-config)      |
| `svgo-version` | The version of [SVGO] to use              | `2`                | [docs](./docs/inputs.md#svgo-version)     |

To configure the Action you simply set a value for any of the above in the
Workflow file. For example:

```yaml
- uses: ericcornelissen/svgo-action@v2
  with:
    repo-token: ${{ secrets.GITHUB_TOKEN }}
    dry-run: true
    ignore: do/not/optimize/**/
    strict: false
    svgo-config: path/to/svgo-config.js
    svgo-version: 2
```

### Advanced Usage

#### Limit Runs

Even though this Action won't do anything if a push or Pull Request does not
touch any SVGs, you may want the Action to run only when an SVG has actually
changed. To do this you can change the Workflow file that uses this Action to be
triggered only when SVGs change. Update the value of `pull_request` and/or
`push` as follows:

> :warning: This will cause the entire Workflow to be run only when an SVG
> changes. Steps that should run for every push or Pull Request must be
> specified in a separate Workflow file.

```yaml
on:
  pull_request:
    paths:
    - "**.svg"
  push:
    paths:
    - "**.svg"
```

[ci-url]: https://github.com/ericcornelissen/svgo-action/actions?query=workflow%3A%22Code+Validation%22+branch%3Amain
[ci-image]: https://img.shields.io/github/workflow/status/ericcornelissen/svgo-action/Code%20Validation/main?logo=github
[coverage-url]: https://codecov.io/gh/ericcornelissen/svgo-action
[coverage-image]: https://codecov.io/gh/ericcornelissen/svgo-action/branch/main/graph/badge.svg
[maintainability-url]: https://codeclimate.com/github/ericcornelissen/svgo-action/maintainability
[maintainability-image]: https://api.codeclimate.com/v1/badges/4b1085a28f00ec5f9225/maintainability
[snyk-image]: https://snyk.io/test/github/ericcornelissen/svgo-action/badge.svg?targetFile=package.json
[snyk-url]: https://snyk.io/test/github/ericcornelissen/svgo-action?targetFile=package.json
[fossa-image]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Fericcornelissen%2Fsvgo-action.svg?type=shield
[fossa-url]: https://app.fossa.com/projects/git%2Bgithub.com%2Fericcornelissen%2Fsvgo-action?ref=badge_shield

[creating a workflow file]: https://docs.github.com/en/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[svgo]: https://github.com/svg/svgo
[the examples]: ./docs/examples.md
[what the action does for each `on` event]: ./docs/events.md
[what the action outputs]: ./docs/outputs.md
