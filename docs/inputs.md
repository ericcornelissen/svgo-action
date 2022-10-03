# SVGO Action Inputs

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

> **Warning** If you misconfigure this input the Action assumes you wanted to
> enable it and set `dry-run` to `true`.

### Examples

To enable dry runs:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v3
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

> **Note** Regardless of the value of this input, the Action will only consider
> files with the `.svg` file extension.

### Examples

To ignore all files in a specific folder:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v3
  with:
    ignore: not/optimized/*
```

To ignore all files in a specific folder and all its subfolders:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v3
  with:
    ignore: not/optimized/**/
```

To have multiple ignore globs, use a [YAML] multiline string:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v3
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

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v3
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

> **Warning** If you misconfigure this input the Action assumes you wanted to
> enable it and set `strict` to `true`. This in turn results in the Action
> failing due to an invalid input.

### Examples

To enable strict mode:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v3
  with:
    strict: true
```

---

## SVGO Config

| Name          | Default value      |
| ------------- | ------------------ |
| `svgo-config` | `"svgo.config.js"` |

The `svgo-config` input allows you to specify the location of the config file
for [SVGO]. The configuration file must be a JavaScript or a [YAML] file. If the
specified file is not found the Action will fall back on SVGO's default
configuration.

### Examples

To use an SVGO config file with a non-standard name:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v3
  with:
    svgo-config: my-svgo-config.js
```

To use an SVGO config file in a folder:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v3
  with:
    svgo-config: path/to/svgo.config.js
```

To use an SVGO config file in the YAML format (e.g. if you're using SVGO v1):

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v2
  with:
    svgo-config: .svgo.yml
```

---

## SVGO Version

| Name           | Default value |
| -------------- | ------------- |
| `svgo-version` | `2`           |

The `svgo-version` input allows you to specify the version of [SVGO] that you
want to use. This can be either `2` for the latest v2 release, or the string
`"project"` for the version of SVGO installed for your project. For `"project"`
both SVGO v1 and v2 are supported.

> **Warning** SVGO v1 has been deprecated, we strongly recommend upgrading to
> SVGO v2. For more information see the [SVGO v2 release notes].

### Examples

To use the SVGO version used by your project:

```yaml
# .github/workflows/optimize.yml

- name: Install dependencies, including SVGO
  run: npm ci
- uses: ericcornelissen/svgo-action@v3
  with:
    svgo-version: project
```

[`on: pull_request`]: ./events.md#on-pull_request
[`on: push`]: ./events.md#on-push
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[svgo]: https://github.com/svg/svgo
[svgo v2 release notes]: https://github.com/svg/svgo/releases/tag/v2.0.0
[yaml]: https://yaml.org/
