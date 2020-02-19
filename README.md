# SVGO action

[![Node.js CI][ci-image]][ci-url]

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
    - uses: ericcornelissen/svgo-action@master
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

_Note: This grants access to the `GITHUB_TOKEN` so the action can make calls to
GitHub's rest API_

### Configure the Action

> :warning: Configuring the action is not yet supported. See [#17] for progress
> in this regard.

[ci-url]:https://github.com/ericcornelissen/svgo-action/actions?query=workflow%3A%22Node.js+CI%22+branch%3Adevelop
[ci-image]: https://github.com/ericcornelissen/svgo-action/workflows/Node.js%20CI/badge.svg
[SVGO]: https://github.com/svg/svgo
[Creating a Workflow file]: https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file
[#17]: https://github.com/ericcornelissen/svgo-action/issues/17
