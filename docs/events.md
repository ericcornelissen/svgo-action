# SVGO Action Events

This file contains the documentation for all GitHub Actions events that the SVGO
Action supports. If an event is not listed here it is not officially supported.

- [`on: pull_request`](#on-pull_request)
- [`on: push`](#on-push)
- [`on: repository_dispatch`](#manually-triggered-events)
- [`on: schedule`](#on-schedule)
- [`on: workflow_dispatch`](#manually-triggered-events)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## `on: pull_request`

> Find out more in the GitHub Actions documentation on [`pull_request` events],
> [branch and tag filters], and [path filters].

In the `pull_request` context, the SVGO Action will optimize all SVGs that have
been added or modified in a Pull Request. This means that an Action run covers
all commits that are part of the Pull Request, not individual commits in a Pull
Request.

The Action will not change SVGs that are not part of the Pull Request, SVGs that
are already optimized or [SVGs that are ignored].

### Configuration

The following [options] have an effect in the `pull_request` context.

| Name                   | Supported          |
| ---------------------- | ------------------ |
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |
| `svgo-version`         | :heavy_check_mark: |

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
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |
| `svgo-version`         | :heavy_check_mark: |

---

## `on: schedule`

> Find out more in the GitHub Actions documentation on [`schedule` events].

In the `schedule` context, the SVGO Action will optimize all SVGs in the
repository's default branch at the scheduled time.

The Action will not change SVGs that are already optimized or [SVGs that are
ignored].

### Configuration

The following [options] have an effect in the `schedule` context.

| Name                   | Supported          |
| ---------------------- | ------------------ |
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |
| `svgo-version`         | :heavy_check_mark: |

## Manually triggered events

> Find out more in the GitHub Actions documentation on [`repository_dispatch`
> events] and [`workflow_dispatch` events].

In the `repository_dispatch` and `workflow_dispatch` context, the SVGO Action
will optimize all SVGs in the repository's default branch.

The Action will not change SVGs that are already optimized or [SVGs that are
ignored].

### Configuration

The following [options] have an effect in the `repository_dispatch` and
`workflow_dispatch` contexts.

| Name                   | Supported          |
| ---------------------- | ------------------ |
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-version`         | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |

[`pull_request` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request
[`push` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#push
[`repository_dispatch` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#repository_dispatch
[`schedule` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule
[`workflow_dispatch` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#workflow_dispatch
[branch and tag filters]: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestbranchestags
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[options]: ./options.md
[path filters]: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestpaths
[SVGs that are ignored]: ./options.md#ignore
