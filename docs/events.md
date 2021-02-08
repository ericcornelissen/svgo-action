# SVGO Action Events

This file contains the documentation for all GitHub Actions events that the SVGO
Action supports.

- [`on: pull_request` & `on: pull_request_event`](#on-pull_request--on-pull_request_event)
- [`on: push`](#on-push)
- [`on: schedule`](#on-schedule)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## `on: pull_request` & `on: pull_request_event`

> Find out more in the GitHub Actions documentation on [`pull_request` events],
> [branch and tag filters], and [path filters].

In the `pull_request` context, the SVGO Action will optimize all SVGs that have
been added or modified in a Pull Request. This means that an Action run covers
all commits that are part of the Pull Request, not individual commits in a Pull
Request.

The Action will not change SVGs that are not part of the Pull Request, SVGs that
are already optimized or [SVGs that are ignored].

You can use `pull_request_event` instead of `pull_request` if you want the SVGO
Action to run on Pull Requests from forks.

### Configuration

The following [options] have an effect in the `pull_request` and
`pull_request_target` contexts.

| Name                   | Supported          |
| ---------------------- | ------------------ |
| `branch`               | :x:                |
| `comment`              | :heavy_check_mark: |
| `commit`               | :heavy_check_mark: |
| `conventional-commits` | :heavy_check_mark: |
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |

---

## `on: push`

> Find out more in the GitHub Actions documentation on [`push` events], [branch
> and tag filters], and [path filters].

In the `push` context, the SVGO Action will optimize all SVGs that have been
added or modified in the commit(s) being pushed. This means that if multiple
commits are pushed at once, the Action run will cover all the added and modified
SVGs in all the commits being pushed.

The Action will not change SVGs that are not part of any of the commits, SVGs
that are already optimized or [SVGs that are ignored].

### Configuration

The following [options] have an effect in the `push` context.

| Name                   | Supported          |
| ---------------------- | ------------------ |
| `branch`               | :x:                |
| `comment`              | :heavy_check_mark: |
| `commit`               | :heavy_check_mark: |
| `conventional-commits` | :heavy_check_mark: |
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |

---

## `on: schedule`

> Find out more in the GitHub Actions documentation on [`schedule` events].

In the `schedule` context, the SVGO Action will optimize all SVGs in the
repositories default branch at the scheduled time.

The Action will not change SVGs that are already optimized or [SVGs that are
ignored].

### Configuration

The following [options] have an effect in the `schedule` context.

| Name                   | Supported          |
| ---------------------- | ------------------ |
| `branch`               | :heavy_check_mark: |
| `comment`              | :x:                |
| `commit`               | :heavy_check_mark: |
| `conventional-commits` | :heavy_check_mark: |
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |

[`pull_request` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request
[`push` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#push
[`schedule` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule
[branch and tag filters]: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestbranchestags
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[options]: ./options.md
[path filters]: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestpaths
[SVGs that are ignored]: ./options.md#ignore
