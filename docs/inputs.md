# SVGO Action Inputs

This documentation describes all the inputs of the SVGO Action.

- [Dry Run](#dry-run)
- [Ignore](#ignore)
- [SVGO Options](#svgo-options)
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

- uses: ericcornelissen/svgo-action@next
  with:
    dry-run: true
```

---

## Ignore

| Name     | Default value |
| -------- | ------------- |
| `ignore` | `""`          |

The `ignore` input allows you to specify SVGs that should be ignored by the
Action. By default, no files are ignored. The value is interpreted as a [glob].
Any file that matches the configured glob will **not** be optimized by the
Action.

> :information_source: Regardless of the value of this input, the Action will
> only consider files with the `.svg` file extensions.

### Examples

To ignore all files in a specific folder:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@next
  with:
    ignore: not/optimized/*
```

To ignore all files in a specific folder and all its subfolders:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@next
  with:
    ignore: not/optimized/**/
```

---

## SVGO Options

| Name           | Default value      |
| -------------- | ------------------ |
| `svgo-options` | `"svgo.config.js"` |

The `svgo-options` input allows you to specify the location of the options file
for [SVGO]. This configuration file must be a JavaScript file or in the [YAML]
format. If the specified file is not found the Action will fall back on SVGO's
default configuration.

### Examples

To use a SVGO options file with a non-standard name:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@next
  with:
    svgo-options: my-svgo-options.js
```

To use an SVGO options file in a folder:

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@next
  with:
    svgo-options: path/to/my-svgo-options.js
```

---

## SVGO Version

| Name           | Default value |
| -------------- | ------------- |
| `svgo-version` | `2`           |

The `svgo-version` input allows you to specify the major version of [SVGO] that
you want to use. This can be either `1` for the latest v1.x.x release or `2` for
the latest v2.x.x release.

If `svgo-version` is `2` you must have an SVGO options file written in
JavaScript. If `svgo-version` is `1` you must have an SVGO options file written
in [YAML]. You can change the SVGO options file used by this Action with the
[SVGO Options](#svgo-options) option.

> :information_source: If you plan to set this to `1`, we recommend upgrading to
> SVGO v2 instead. For more information see the [SVGO v2 release notes].

### Examples

To change the SVGO major version to v1.x.x:

> :warning: If you set `svgo-version: 1` you **must** set `svgo-options` to a
> [YAML] file.

```yaml
# .github/workflows/optimize.yml

- uses: ericcornelissen/svgo-action@next
  with:
    svgo-options: .svgo.yml
    svgo-version: 1
```

[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[svgo]: https://github.com/svg/svgo
[svgo v2 release notes]: https://github.com/svg/svgo/releases/tag/v2.0.0
[yaml]: https://yaml.org/
