# SVGO action

[![GitHub Marketplace][marketplace-image]][marketplace-url]
[![Node.js CI][ci-image]][ci-url]
[![Coverage Report][coverage-image]][coverage-url]

Automatically run [SVGO] on SVGs in Pull Requests.

## Usage

### Install the Action

Create a Workflow file (e.g.: `.github/workflows/svgo.yml`, see [Creating a
Workflow file]) with the following content to utilize the SVGO action:

```yaml
name: "Pull Request SVGOptimizer"
on:
- pull_request

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
    - uses: ericcornelissen/svgo-action@v0.2.0
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

_Note: This grants access to the `GITHUB_TOKEN` so the action can make calls to
GitHub's rest API_

### Configure the Action

You can add any of the the options listed below after the `repo-token` in the
Workflow file to configure the action.

> :warning: In the future the action will have more options. See [#17] for
> progress in this regard.

- `dry-run`: If enabled, the action doesn't commit changes back.
  - Possible values: `false`, `true`
  - Default value: `false`
  - Example: `dry-run: true`

### Advanced Usage

#### Limit Runs

Even though this action won't do anything if a Pull Request does not touch any
SVG files, you may want the action to run only when an SVG was actually changed.
To do this you can change the Workflow file that uses this action to be
triggered only when SVG files change.

> :warning: This will cause **any** action specified in the Workflow file to be
> run only when an SVG changes. If there are actions that should run for every
> Pull Request they must be specified in a separate Workflow file.

To run this action only when SVG files are changed, update the `on:`
configuration as follows:

```yaml
name: "Pull Request SVGOptimizer"
on:
  pull_request:
    paths:
      - '**.svg'

jobs:
  ...
```

[marketplace-image]: https://img.shields.io/badge/Marketplace-v0.2.0-undefined.svg?logo=github&logoColor=white&style=flat
[marketplace-url]: https://github.com/marketplace/actions/svgo-action
[ci-url]: https://github.com/ericcornelissen/svgo-action/actions?query=workflow%3A%22Node.js+CI%22+branch%3Adevelop
[ci-image]: https://github.com/ericcornelissen/svgo-action/workflows/Node.js%20CI/badge.svg
[coverage-url]: https://codecov.io/gh/ericcornelissen/svgo-action
[coverage-image]: https://codecov.io/gh/ericcornelissen/svgo-action/branch/develop/graph/badge.svg
[SVGO]: https://github.com/svg/svgo
[Creating a Workflow file]: https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file
[#17]: https://github.com/ericcornelissen/svgo-action/issues/17
