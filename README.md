<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# SVGO Action

[![Build status][ci-image]][ci-url]
[![Coverage Report][coverage-image]][coverage-url]

Automatically run [SVGO] with GitHub Actions.

## Usage

### Install the Action

> [!WARNING]
> Support for SVGO Action, in general, will end 2024-04-30. We recommend finding
> an alternative before then and to stop using this Action.

Create a Workflow file (e.g.: `.github/workflows/optimize.yml`, see [Creating a
Workflow file]) with the workflow below - or check out the [examples] for
various complete workflows. You can also check [what the Action does for each
`on` event] and [what the Action outputs] for subsequent steps.

```yml
name: Optimize
on:
  # Comment the next line if you don't want the Action to run on Pull Requests.
  pull_request: ~
  # Uncomment the next line if you want the Action to run on pushes.
  #   push: ~
  # Uncomment the next 2 lines if you want the Action to run on a schedule.
  #   schedule:
  #     - cron:  '0 * * * 1'  # See https://crontab.guru/
  # Uncomment 1 of the next 2 lines if you want to manually trigger the Action.
  #   repository_dispatch:
  #   workflow_dispatch:

jobs:
  svgs:
    name: SVGs
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Uncomment the next 2 lines to select a branch for schedule or dispatch.
      #   with:
      #     ref: main
      - uses: ericcornelissen/svgo-action@v4
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

_Note: This grants access to the `GITHUB_TOKEN` so the Action can make calls to
GitHub's rest API. This is only needed for `pull_request` and `push` events._

### Configure the Action

The following inputs are available when using the SVGO Action. More details can
be found in the [inputs documentation].

```yml
- uses: ericcornelissen/svgo-action@v4
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
    # Default: 3
    svgo-version: 2
```

### Runners

This Action is tested on the official [ubuntu-20.04] and [ubuntu-22.04] runner
images. It is recommended to use one of these images when using this Action.

### Security

#### Permissions

The minimum required [permissions] needed to run this Action are:

```yml
permissions:
  contents: read
  # Uncomment the next line if you're using the Action on Pull Requests
  #   pull-requests: read
```

Or use `read-all` to allow reading in all scopes (recommended for open source):

```yml
permissions: read-all
```

#### Network

This Action requires network access to the endpoint `api.github.com:443` when
triggered by `pull_request:` or `push:`. Otherwise it does not require any
network access.

## License

The source code is licensed under the `MIT` license, see [LICENSE] for the full
license text. The documentation text is licensed under [CC BY-SA 4.0]; code
snippets under the [MIT license]. Supporting code, such a scripts and tests, is
licensed under the [MIT license] or the [MIT-0 license].

[ci-url]: https://github.com/ericcornelissen/svgo-action/actions/workflows/check.yml
[ci-image]: https://github.com/ericcornelissen/svgo-action/actions/workflows/check.yml/badge.svg
[coverage-url]: https://codecov.io/gh/ericcornelissen/svgo-action
[coverage-image]: https://codecov.io/gh/ericcornelissen/svgo-action/branch/main/graph/badge.svg

[cc by-sa 4.0]: https://creativecommons.org/licenses/by-sa/4.0/
[creating a workflow file]: https://docs.github.com/en/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow
[examples]: ./docs/examples.md
[inputs documentation]: ./docs/inputs.md
[license]: ./LICENSE
[mit license]: https://opensource.org/license/mit/
[mit-0 license]: https://opensource.org/license/mit-0/
[permissions]: https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#permissions
[svgo]: https://github.com/svg/svgo
[ubuntu-20.04]: https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2004-Readme.md
[ubuntu-22.04]: https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2204-Readme.md
[what the action does for each `on` event]: ./docs/events.md
[what the action outputs]: ./docs/outputs.md
