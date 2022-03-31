# SVGO Action Examples

This documentation provides various example workflows of how you might use the
SVGO Action.

- [Optimize on Pushes](#optimize-on-pushes)
- [Optimize Pull Requests with Comments](#optimize-pull-requests-with-comments)
- [Scheduled Optimization Commits](#scheduled-optimization-commits)
- [Optimize SVGs on Demand](#optimize-svgs-on-demand)
- [Using Any SVGO Version](#using-any-svgo-version)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## Optimize on Pushes

This example uses [actions/checkout] and [stefanzweifel/git-auto-commit-action]
to automatically optimize and commit new or modified SVGs in commits pushed to
the `main` branch. If there are no changes, nothing will be committed.

Check out [what the Action outputs] to customize the commit message to your
liking.

```yaml
# .github/workflows/optimize.yml

name: Optimize
on:
  push:
    branches: [main]

# The minimum required permissions
permissions:
  contents: write

jobs:
  svgs:
    name: SVGs
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    - name: Optimize SVGs
      uses: ericcornelissen/svgo-action@v3
      id: svgo
      with:
        repo-token: ${{secrets.GITHUB_TOKEN}}
    - name: Commit optimizations
      uses: stefanzweifel/git-auto-commit-action@v4
      if: ${{steps.svgo.outputs.DID_OPTIMIZE}}
      with:
        commit_message: Optimize ${{steps.svgo.outputs.OPTIMIZED_COUNT}} SVG(s)
```

---

## Optimize Pull Requests with Comments

This example uses [actions/checkout], [stefanzweifel/git-auto-commit-action],
and [thollander/actions-comment-pull-request] to automatically optimize and
commit new or modified SVGs for Pull Requests into the `main` branch. It will
also comment on the Pull Request that optimizations have been committed. If
there are no changes, nothing will be committed or commented.

Check out [what the Action outputs] to customize the commit message and Pull
Request comment to your liking.

> :warning: This does not work for Pull Requests from forks. This is because
> GitHub Actions do not have permission to alter forked repositories.

```yaml
# .github/workflows/optimize.yml

name: Optimize
on:
  pull_request:
    branches: [main]

# The minimum required permissions
permissions:
  contents: write
  pull-request: write

jobs:
  svgs:
    name: SVGs
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    - name: Optimize SVGs
      uses: ericcornelissen/svgo-action@v3
      id: svgo
      with:
        repo-token: ${{secrets.GITHUB_TOKEN}}
    - name: Commit optimizations
      uses: stefanzweifel/git-auto-commit-action@v4
      if: ${{steps.svgo.outputs.DID_OPTIMIZE}}
      with:
        commit_message: Optimize ${{steps.svgo.outputs.OPTIMIZED_COUNT}} SVG(s)
    - name: Comment on Pull Request
      uses: thollander/actions-comment-pull-request@v1
      if: ${{steps.svgo.outputs.DID_OPTIMIZE && github.event_name == 'pull_request'}}
      with:
        GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
        message: Optimized ${{steps.svgo.outputs.OPTIMIZED_COUNT}} SVG(s)
```

---

## Scheduled Optimization Commits

This example uses [actions/checkout] and [stefanzweifel/git-auto-commit-action]
to optimize and commit all SVGs in the repository every Monday. If there are no
changes, nothing will be committed.

Check out [what the Action outputs] to customize the commit message to your
liking.

```yaml
# .github/workflows/optimize.yml

name: Optimize
on:
  schedule:
  # Schedule the workflow for once a week on Monday.
  # For more information, see: https://crontab.guru/
  - cron:  '0 0 * * 1'

# The minimum required permissions
permissions:
  contents: write

jobs:
  svgs:
    name: SVGs
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    - name: Optimize SVGs
      uses: ericcornelissen/svgo-action@v3
      id: svgo
    - name: Commit optimizations
      uses: stefanzweifel/git-auto-commit-action@v4
      if: ${{steps.svgo.outputs.DID_OPTIMIZE}}
      with:
        commit_message: Optimize ${{steps.svgo.outputs.OPTIMIZED_COUNT}} SVG(s)
```

---

## Optimize SVGs on Demand

This example uses [actions/checkout] and [stefanzweifel/git-auto-commit-action]
to optimize and commit all SVGs in the repository on `workflow_dispatch` events.
You can trigger this either by making an HTTP request to a specific GitHub
endpoint (see comment in the snippet) or on GitHub by navigating to the
workflow's page in your repository.

Check out [what the Action outputs] to customize the commit message to your
liking.

```yaml
# .github/workflows/optimize.yml

name: Optimize
on: [workflow_dispatch]

# This Workflow is triggered through the GitHub API:
#   curl -X POST \
#        -H "Authorization: Bearer <token>" \
#        -d '{"ref":"main"}' \
#        https://api.github.com/repos/<owner>/<repo>/actions/workflows/optimize.yml/dispatches
#
# Replacing <token> by a personal access token with scope `public_repo`, <owner>
# by the repositories owner (user or organization), <repo> by the repositories
# name.
#
# NOTE: "main" in the payload (-d) refers to the branch on which the workflow
# should be triggered. Usually you want this to be the default branch.
#
# NOTE: "optimize.yml" in the URL has to be updated if the workflow file is not
# called "optimize.yml".

# The minimum required permissions
permissions:
  contents: write

jobs:
  svgs:
    name: SVGs
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    - name: Optimize SVGs
      uses: ericcornelissen/svgo-action@v3
      id: svgo
    - name: Commit optimizations
      uses: stefanzweifel/git-auto-commit-action@v4
      if: ${{steps.svgo.outputs.DID_OPTIMIZE}}
      with:
        commit_message: Optimize ${{steps.svgo.outputs.OPTIMIZED_COUNT}} SVG(s)
```

---

## Using Any SVGO Version

This example uses [actions/checkout] and [npm] to optimize SVGs in the project
using a specific version of SVGO. You can combine this example with one of the
other examples in this document to get the optimized SVGs back in your project.

```yaml
# .github/workflows/optimize.yml

name: Optimize
on:
  # You can replace "schedule" with any other event you need and this example
  # will still work.
  schedule:
  - cron:  '0 0 * * 1'

# The minimum required permissions
permissions:
  contents: read

jobs:
  svgs:
    name: SVGs
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    # If SVGO is a (dev)dependency of your project you can just install your
    # dependencies as usual. If SVGO is not yet a dependency of your project, we
    # recommend you run `npm install --save-dev svgo@v2` and commit your project
    # manifests (e.g. package.json and package-lock.json) first.
    - name: Install dependencies
      run: npm ci
    - name: Optimize SVGs
      uses: ericcornelissen/svgo-action@v3
      with:
        svgo-version: project
```

[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[what the action outputs]: ./outputs.md

[actions/checkout]: https://github.com/marketplace/actions/checkout
[npm]: https://www.npmjs.com/
[stefanzweifel/git-auto-commit-action]: https://github.com/marketplace/actions/git-auto-commit
[thollander/actions-comment-pull-request]: https://github.com/marketplace/actions/comment-pull-request
