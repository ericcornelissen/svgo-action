# SVGO Action Events

> **Warning**: Version 3 of the SVGO Action is end-of-life (EOL) since
> 2023-12-31. No support will be provided going forward.

This documentation describes the behavior of the SVGO Action for every GitHub
Actions event that is supported. If an event is not listed here it is not
officially supported.

- [`on: pull_request`](#on-pull_request)
- [`on: push`](#on-push)
- [`on: repository_dispatch`](#dispatch-events)
- [`on: schedule`](#on-schedule)
- [`on: workflow_dispatch`](#dispatch-events)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

> **Warning**: The Action will run on any event if [strict mode] is not enabled.
> However, this is not officially supported so you may encounter unexpected
> behaviour.

---

## `on: pull_request`

> Find out more in the GitHub Actions documentation on [`pull_request` events],
> [branch and tag filters], and [path filters].

In the `pull_request` context the SVGO Action will optimize all SVGs that have
been added or modified in the Pull Request. Any SVGs that are in the repository
but have not been modified in the Pull Request will not be optimized.

The Action will never modify SVGs that are already optimized or [SVGs that are
ignored].

### Inputs

The following [inputs] are available in the `pull_request` context.

| Name           | Supported | Required |
| -------------- | --------- | -------- |
| `dry-run`      | Yes       | No       |
| `ignore`       | Yes       | No       |
| `repo-token`   | Yes       | Yes      |
| `strict`       | Yes       | No       |
| `svgo-config`  | Yes       | No       |
| `svgo-version` | Yes       | No       |

### Outputs

The following [outputs] are available in the `pull_request` context.

| Name              | Outputted |
| ----------------- | --------- |
| `DID_OPTIMIZE`    | Yes       |
| `OPTIMIZED_COUNT` | Yes       |
| `SVG_COUNT`       | Yes       |

---

## `on: push`

> Find out more in the GitHub Actions documentation on [`push` events], [branch
> and tag filters], and [path filters].

In the `push` context the SVGO Action will optimize all SVGs that have been
added or modified in the commit(s) being pushed. Any SVGs that are in the
repository but have not been modified in the commit(s) will not be optimized.

The Action will never modify SVGs that are already optimized or [SVGs that are
ignored].

### Inputs

The following [inputs] are available in the `push` context.

| Name           | Supported | Required |
| -------------- | --------- | -------- |
| `dry-run`      | Yes       | No       |
| `ignore`       | Yes       | No       |
| `repo-token`   | Yes       | Yes      |
| `strict`       | Yes       | No       |
| `svgo-config`  | Yes       | No       |
| `svgo-version` | Yes       | No       |

### Outputs

The following [outputs] are available in the `push` context.

| Name              | Outputted |
| ----------------- | --------- |
| `DID_OPTIMIZE`    | Yes       |
| `OPTIMIZED_COUNT` | Yes       |
| `SVG_COUNT`       | Yes       |

---

## `on: schedule`

> Find out more in the GitHub Actions documentation on [`schedule` events].

In the `schedule` context the SVGO Action will optimize all SVGs in the
repository at the scheduled time.

The Action will never modify SVGs that are already optimized or [SVGs that are
ignored].

### Inputs

The following [inputs] are available in the `schedule` context.

| Name           | Supported | Required |
| -------------- | --------- | -------- |
| `dry-run`      | Yes       | No       |
| `ignore`       | Yes       | No       |
| `repo-token`   | No        | No       |
| `strict`       | Yes       | No       |
| `svgo-config`  | Yes       | No       |
| `svgo-version` | Yes       | No       |

### Outputs

The following [outputs] are available in the `schedule` context.

| Name              | Outputted |
| ----------------- | --------- |
| `DID_OPTIMIZE`    | Yes       |
| `OPTIMIZED_COUNT` | Yes       |
| `SVG_COUNT`       | Yes       |

---

## Dispatch Events

> Find out more in the GitHub Actions documentation on [`repository_dispatch`
> events] and [`workflow_dispatch` events].

In the `repository_dispatch` and `workflow_dispatch` contexts the SVGO Action
will optimize all SVGs in the repository.

The Action will never modify SVGs that are already optimized or [SVGs that are
ignored].

### Inputs

The following [inputs] are available in the `repository_dispatch` and
`workflow_dispatch` contexts.

| Name           | Supported | Required |
| -------------- | --------- | -------- |
| `dry-run`      | Yes       | No       |
| `ignore`       | Yes       | No       |
| `repo-token`   | No        | No       |
| `strict`       | Yes       | No       |
| `svgo-config`  | Yes       | No       |
| `svgo-version` | Yes       | No       |

### Outputs

The following [outputs] are available in the `repository_dispatch` and
`workflow_dispatch` contexts.

| Name              | Outputted |
| ----------------- | --------- |
| `DID_OPTIMIZE`    | Yes       |
| `OPTIMIZED_COUNT` | Yes       |
| `SVG_COUNT`       | Yes       |

---

_Content licensed under [CC BY-SA 4.0]; Code snippets under the [MIT license]._

[`pull_request` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request
[`push` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#push
[`repository_dispatch` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#repository_dispatch
[`schedule` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule
[`workflow_dispatch` events]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#workflow_dispatch
[branch and tag filters]: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestbranchestags
[cc by-sa 4.0]: https://creativecommons.org/licenses/by-sa/4.0/
[inputs]: ./inputs.md
[mit license]: https://opensource.org/license/mit/
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[outputs]: ./outputs.md
[path filters]: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestpaths
[strict mode]: ./inputs.md#strict-mode
[svgs that are ignored]: ./inputs.md#ignore
