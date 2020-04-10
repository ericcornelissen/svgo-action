# SVGO action

[![GitHub Marketplace][marketplace-image]][marketplace-url]
[![Node.js CI][ci-image]][ci-url]
[![Coverage Report][coverage-image]][coverage-url]
[![Maintainability][maintainability-image]][maintainability-url]

Automatically run [SVGO] on SVGs in Pull Requests.

## Usage

### Install the Action

Create a Workflow file (e.g.: `.github/workflows/svgo.yml`, see [Creating a
Workflow file]) with the following content to utilize the SVGO action:

```yaml
name: Pull Request SVGOptimizer
on:
- pull_request

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
    - uses: ericcornelissen/svgo-action@v0.4.3
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```

_Note: This grants access to the `GITHUB_TOKEN` so the action can make calls to
GitHub's rest API_

### Configure the Action

There are a couple of ways for you to configure the Action. You can configure it
[in the Workflow file], [in `.github/svgo-action.yml`], or [in another
configuration file]. Below you can find the available options.

- `comments`: Enable comments on Pull Requests with an optimization summary.
  - Possible values: `false`, `true`
  - Default value: `false`
  - Example: `comments: true`
- `commit`: Configure the commit message for the Action.
  - [Full documentation](docs/configuring-the-commit.md)
- `conventional-commits`: Use [conventional commit] message titles for commits.
  - Possible values: `false`, `true`
  - Default value: `false`
  - Example: `conventional-commits: true`
- `dry-run`: If enabled, the action doesn't commit changes back.
  - Possible values: `false`, `true`
  - Default value: `false`
  - Example: `dry-run: true`
- `svgo-options`: Specify the path of the file in the repository that should be
  used as configuration for [SVGO].
  - Possible values: _Any file path_
  - Default value: `".svgo.yml"`
  - Example: `svgo-options: path/to/svgo-options.yml`

#### In the Workflow file

The first way to configure the action is inside the Workflow file, after the
`repo-token`. For example:

```yaml
with:
  repo-token: ${{ secrets.GITHUB_TOKEN }}
  comments: true
  conventional-commits: true
  dry-run: true
  svgo-options: path/to/svgo-options.yml
```

#### In `.github/svgo-action.yml`

If you prefer to separate the Action configuration from the Workflow file you
can add a file called `svgo-action.yml` inside the `.github` directory. Then,
you can configure the Action inside this file. For example:

```yaml
comments: true
dry-run: true
svgo-options: path/to/svgo-options.yml
commit:
  conventional: false
  title: Optimized {{optimizedCount}} SVG(s)
  description: |
    Namely:
    {{filesList}}
```

#### In Another Configuration File

Lastly, if you prefer to use a different file from `.github/svgo-action.yml`,
it is possible to specify a `configuration-path` in the Workflow file. This
value should point to the configuration file you want to use. For example:

> :warning: The configuration file must always be a valid YAML file.

```yaml
with:
  repo-token: ${{ secrets.GITHUB_TOKEN }}
  configuration-path: path/to/configuration/file.yml
```

### Advanced Usage

#### Manually Disabling the Action

It is possible to manually disable the Action from a commit message. This can be
achieved by including the string "_disable-svgo-action_" anywhere in the commit
message.

> :warning: This will only stop the Action from optimizing SVGs in the build
> corresponding to the commit whose commit message contains the string.

Another possibility is to disable the Action from a Pull Request comment. This
can be achieved by including the string "_disable-svgo-action_" anywhere in any
comment on the Pull Request.

> :warning: This will stop the Action from optimizing SVGs in any subsequent
> build for that Pull Request.

If you want to enable the Action for a singe commit when it is disabled from the
Pull Request comments, include the string "_enable-svgo-action_" anywhere in the
commit message. Then, for that commit only, the Action will optimize SVGs.

If instead you want to enable the Action again for all commits, include the
string "_enable-svgo-action_" anywhere in a comment on the Pull Request after it
has been disabled, and the Action will start optimizing SVGs again.

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
name: Pull Request SVGOptimizer
on:
  pull_request:
    paths:
      - "**.svg"

jobs:
  ...
```

[marketplace-url]: https://github.com/marketplace/actions/svgo-action?version=v0.4.3
[marketplace-image]: https://img.shields.io/badge/Marketplace-v0.4.3-undefined.svg?logo=github&logoColor=white&style=flat
[ci-url]: https://github.com/ericcornelissen/svgo-action/actions?query=workflow%3A%22Node.js+CI%22+branch%3Adevelop
[ci-image]: https://github.com/ericcornelissen/svgo-action/workflows/Node.js%20CI/badge.svg
[coverage-url]: https://codecov.io/gh/ericcornelissen/svgo-action
[coverage-image]: https://codecov.io/gh/ericcornelissen/svgo-action/branch/develop/graph/badge.svg
[maintainability-url]: https://codeclimate.com/github/ericcornelissen/svgo-action/maintainability
[maintainability-image]: https://api.codeclimate.com/v1/badges/4b1085a28f00ec5f9225/maintainability
[SVGO]: https://github.com/svg/svgo
[Creating a Workflow file]: https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file
[in the Workflow file]: #in-the-workflow-file
[in `.github/svgo-action.yml`]: #in-githubsvgo-actionyml
[in another configuration file]: #in-another-configuration-file
[conventional commit]: https://www.conventionalcommits.org/en/v1.0.0/
