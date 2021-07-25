# SVGO Action Events

This documentation describes the behavior of the SVGO Action for every GitHub
Actions event that is supported. If an event is not listed here it is not
officially supported.

- [`on: pull_request`](#on-pull_request)
- [`on: push`](#on-push)
- [`on: repository_dispatch`](#manual-trigger-events)
- [`on: schedule`](#on-schedule)
- [`on: workflow_dispatch`](#manual-trigger-events)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## `on: pull_request`

> Find out more in the GitHub Actions documentation on [`pull_request` events],
> [branch and tag filters], and [path filters].

In the `pull_request` context the SVGO Action will optimize all SVGs that have
been added or modified in the Pull Request. Any SVGs that are in the repository
but have not been modified in the Pull Request will not be optimized.

The Action will never modify SVGs that are already optimized or [SVGs that are
ignored].

### Options

The following [options] have can be used in the `pull_request` context.

| Name           | Supported          |
| -------------- | ------------------ |
| `dry-run`      | :heavy_check_mark: |
| `ignore`       | :heavy_check_mark: |
| `svgo-config`  | :heavy_check_mark: |
| `svgo-version` | :heavy_check_mark: |

### Outputs

The following [outputs] are available in the `pull_request` context.

| Name              | Outputted          |
| ----------------- | ------------------ |
| `DID_OPTIMIZE`    | :heavy_check_mark: |
| `IGNORED_COUNT`   | :heavy_check_mark: |
| `OPTIMIZED_COUNT` | :heavy_check_mark: |
| `SVG_COUNT`       | :heavy_check_mark: |

---

## `on: push`

> Find out more in the GitHub Actions documentation on [`push` events], [branch
> and tag filters], and [path filters].

In the `push` context the SVGO Action will optimize all SVGs that have been
added or modified in the commit(s) being pushed. Any SVGs that are in the
repository but have not been modified in the commit(s) will not be optimized.

The Action will never modify SVGs that are already optimized or [SVGs that are
ignored].

### Options

The following [options] have can be used in the `push` context.

| Name           | Supported          |
| -------------- | ------------------ |
| `dry-run`      | :heavy_check_mark: |
| `ignore`       | :heavy_check_mark: |
| `svgo-config`  | :heavy_check_mark: |
| `svgo-version` | :heavy_check_mark: |

### Outputs

The following [outputs] are available in the `push` context.

| Name              | Outputted          |
| ----------------- | ------------------ |
| `DID_OPTIMIZE`    | :heavy_check_mark: |
| `IGNORED_COUNT`   | :heavy_check_mark: |
| `OPTIMIZED_COUNT` | :heavy_check_mark: |
| `SVG_COUNT`       | :heavy_check_mark: |

---

## `on: schedule`

> Find out more in the GitHub Actions documentation on [`schedule` events].

In the `schedule` context the SVGO Action will optimize all SVGs in the project
at the scheduled time.

The Action will never modify SVGs that are already optimized or [SVGs that are
ignored].

### Options

The following [options] have can be used in the `schedule` context.

| Name           | Supported          |
| -------------- | ------------------ |
| `dry-run`      | :heavy_check_mark: |
| `ignore`       | :heavy_check_mark: |
| `svgo-config`  | :heavy_check_mark: |
| `svgo-version` | :heavy_check_mark: |

### Outputs

The following [outputs] are available in the `schedule` context.

| Name              | Outputted          |
| ----------------- | ------------------ |
| `DID_OPTIMIZE`    | :heavy_check_mark: |
| `IGNORED_COUNT`   | :heavy_check_mark: |
| `OPTIMIZED_COUNT` | :heavy_check_mark: |
| `SVG_COUNT`       | :heavy_check_mark: |

---

## Manual Trigger Events

> Find out more in the GitHub Actions documentation on [`repository_dispatch`
> events] and [`workflow_dispatch` events].

In the `repository_dispatch` and `workflow_dispatch` contexts the SVGO Action
will optimize all SVGs in the repository.

The Action will never modify SVGs that are already optimized or [SVGs that are
ignored].

### Options

The following [options] have can be used in the `repository_dispatch` and
`workflow_dispatch` contexts.

| Name           | Supported          |
| -------------- | ------------------ |
| `dry-run`      | :heavy_check_mark: |
| `ignore`       | :heavy_check_mark: |
| `svgo-config`  | :heavy_check_mark: |
| `svgo-version` | :heavy_check_mark: |

### Outputs

The following [outputs] are available in the `repository_dispatch` and
`workflow_dispatch` contexts.

| Name              | Outputted          |
| ----------------- | ------------------ |
| `DID_OPTIMIZE`    | :heavy_check_mark: |
| `IGNORED_COUNT`   | :heavy_check_mark: |
| `OPTIMIZED_COUNT` | :heavy_check_mark: |
| `SVG_COUNT`       | :heavy_check_mark: |

[`pull_request` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request
[`push` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#push
[`repository_dispatch` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#repository_dispatch
[`schedule` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule
[`workflow_dispatch` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#workflow_dispatch
[branch and tag filters]: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestbranchestags
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[options]: ./options.md
[outputs]: ./outputs.md
[path filters]: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestpaths
[svgs that are ignored]: ./options.md#ignore
