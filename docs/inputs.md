<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# SVGO Action Inputs

> [!WARNING]
> Support for SVGO Action, in general, will end 2024-04-30. We recommend finding
> an alternative before then and to stop using this Action.

This documentation describes all the inputs of the SVGO Action.

- [Dry Run](#dry-run)
- [Ignore](#ignore)
- [Repository Token](#repository-token)
- [Strict Mode](#strict-mode)
- [SVGO Config](#svgo-config)
- [SVGO Version](#svgo-version)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## Dry Run

| Name      | Default value |
| --------- | ------------- |
| `dry-run` | `false`       |

The `dry-run` input can be used to run the Action without having it write any
changes. This can be useful for debugging or when you just want to give the
Action a try.

> [!NOTE]
> If you misconfigure this input the Action assumes you wanted to enable it and
> set `dry-run` to `true`.

### Examples

To enable dry runs:

```yml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v4
  with:
    dry-run: true
```

---

## Ignore

| Name     | Default value |
| -------- | ------------- |
| `ignore` | `""`          |

The `ignore` input allows you to specify what SVGs should be ignored by the
Action. By default, no files are ignored. The value is interpreted as a [glob],
if there are multiple lines each line is interpreted as a [glob]. Any file that
matches (any of) the configured glob(s) will **not** be optimized by the Action.

> [!NOTE]
> Regardless of the value of this input, the Action will only consider files
> with the `.svg` file extension.

### Examples

To ignore all files in a specific folder:

```yml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v4
  with:
    ignore: not/optimized/*
```

To ignore all files in a specific folder and all its subfolders:

```yml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v4
  with:
    ignore: not/optimized/**/
```

To have multiple ignore globs, use a [YAML] multiline string:

```yml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v4
  with:
    ignore: |
      folder1/*
      folder2/**/
```

---

## Repository Token

| Name         | Default value |
| ------------ | ------------- |
| `repo-token` | `""`          |

The `repo-token` input is required when using this Action [`on: pull_request`]
or [`on: push`]. It is needed to make API request to GitHub so that the Action
can determine which SVGs should be optimized.

### Examples

To set the `repo-token` you will typically want to use:

```yml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v4
  with:
    repo-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Strict Mode

| Name     | Default value |
| -------- | ------------- |
| `strict` | `false`       |

The `strict` input can be used to enable _strict mode_. In strict mode, the
Action will fail in the event of a non-critical error (instead of just in the
event of a critical error).

> [!NOTE]
> If you misconfigure this input the Action assumes you wanted to enable it and
> set `strict` to `true`. This in turn results in the Action failing due to an
> invalid input.

### Examples

To enable strict mode:

```yml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v4
  with:
    strict: true
```

---

## SVGO Config

| Name          | Default value      |
| ------------- | ------------------ |
| `svgo-config` | `"svgo.config.js"` |

The `svgo-config` input allows you to specify the location of the config file
for [SVGO]. The configuration file must be a JavaScript. If the specified file
is not found the Action will fall back on SVGO's default configuration.

### Examples

To use an SVGO config file with a non-standard name:

```yml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v4
  with:
    svgo-config: my-svgo-config.js
```

To use an SVGO config file in a folder:

```yml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v4
  with:
    svgo-config: path/to/svgo.config.js
```

---

## SVGO Version

| Name           | Default value |
| -------------- | ------------- |
| `svgo-version` | `3`           |

The `svgo-version` input allows you to specify the version of [SVGO] that you
want to use. This can be either `3` for the latest v3 release, `2` for the
latest v2 release, or the string `"project"` for the version of SVGO installed
for your project. For `"project"` only SVGO v2 and v3 are supported.

### Examples

To use the SVGO version 2:

```yml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v4
  with:
    svgo-version: 2
```

To use the SVGO version used by your project:

```yml
# .github/workflows/optimize.yml

- name: Install dependencies, including SVGO
  run: npm clean-install
- uses: ericcornelissen/svgo-action@v4
  with:
    svgo-version: project
```

---

_Content licensed under [CC BY-SA 4.0]; Code snippets under the [MIT license]._

[`on: pull_request`]: ./events.md#on-pull_request
[`on: push`]: ./events.md#on-push
[cc by-sa 4.0]: https://creativecommons.org/licenses/by-sa/4.0/
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[mit license]: https://opensource.org/license/mit/
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[svgo]: https://github.com/svg/svgo
[yaml]: https://yaml.org/
