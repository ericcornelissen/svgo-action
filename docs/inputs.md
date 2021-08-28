# SVGO Action Inputs

This documentation describes all the inputs of the SVGO Action.

- [Dry Run](#dry-run)
- [Ignore](#ignore)
- [Repository Token](#repository-token)
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

> :warning: If you misconfigure this input the Action assumes you wanted to
> enable it and set `dry-run` to `true`.

### Examples

To enable dry runs:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v2
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

> :information_source: Regardless of the value of this input, the Action will
> only consider files with the `.svg` file extension.

### Examples

To ignore all files in a specific folder:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v2
  with:
    ignore: not/optimized/*
```

To ignore all files in a specific folder and all its subfolders:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v2
  with:
    ignore: not/optimized/**/
```

To use multiple ignore globs, use [YAML] multiline strings:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v2
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

- uses: ericcornelissen/svgo-action@v2
  with:
    repo-token: ${{ secrets.GITHUB_TOKEN }}
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

> :information_source: If `svgo-version` is configured to `1` the default value
> of `svgo-config` changes to `".svgo.yml"`.

### Examples

To use an SVGO config file with a non-standard name:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v2
  with:
    svgo-config: my-svgo-config.js
```

To use an SVGO config file in a folder:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v2
  with:
    svgo-config: path/to/svgo.config.js
```

---

## SVGO Version

| Name           | Default value |
| -------------- | ------------- |
| `svgo-version` | `2`           |

The `svgo-version` input allows you to specify the major version of [SVGO] that
you want to use. This can be either `1` for the latest v1.x.x release or `2` for
the latest v2.x.x release.

If `svgo-version` is `2` you must have a JavaScript-based SVGO config file. If
`svgo-version` is `1` you must have a [YAML]-based SVGO config file. You can
change the SVGO config file used by the Action using the [SVGO
Config](#svgo-config) input.

> :information_source: If you plan to set this to `1`, we recommend upgrading to
> SVGO v2 instead. For more information see the [SVGO v2 release notes].

### Examples

To change the SVGO major version to v1.x.x (note that the default `svgo-config`
will be `".svgo.yml"`):

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@v2
  with:
    svgo-version: 1
```

[`on: pull_request`]: ./events.md#on-pull_request
[`on: push`]: ./events.md#on-push

[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[svgo]: https://github.com/svg/svgo
[svgo v2 release notes]: https://github.com/svg/svgo/releases/tag/v2.0.0
[yaml]: https://yaml.org/
