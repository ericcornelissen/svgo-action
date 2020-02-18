# SVGO action

Automatically run SVGO on SVGs in Pull Requests.

## Usage

### Create a Workflow

Create a Workflow file (e.g.: `.github/workflows/svgo.yml`, see [Creating a Workflow file]) with the following content to utilize the SVGO action:

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

_Note: This grants access to the `GITHUB_TOKEN` so the action can make calls to GitHub's rest API_

[Creating a Workflow file]: https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file
