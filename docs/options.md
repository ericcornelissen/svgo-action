# SVGO Action Options

This file contains the documentation for all options for the SVGO Action.

- [Comment](#comment)
- [Configuration Path](#configuration-path)
- [Dry run](#dry-run)
- [Ignore](#ignore)
- [SVGO Options](#svgo-options)
- [SVGO Version](#svgo-version)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## Comment

| Name      | Default Value | Workflow file      | Config File        |
| --------- | ------------- | ------------------ | ------------------ |
| `comment` | `false`       | :heavy_check_mark: | :heavy_check_mark: |

The _comment_ options can be used to enable comments by the Action on Pull
Requests. The comment by the Action contains a summary of the optimization by
the Action. If the Action did not do anything, it won't leave a comment.

Alternatively, the _comment_ option can be used to configure the contents of
comments by the Action. By setting the value to a string, comments are enabled
and the string will be used as the comment. The comment can be a template string
as described in [the templating documentation].

> :warning: This option only affects the behaviour of the Action when running on
> a Pull Request.

### Examples

To enable comments by the Action:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@next
  with:
    comment: true


# .github/svgo-action.yml
comment: true
```

To configure the contents of comments by the Action (using [YAML multiline
strings]):

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@next
  with:
    comment: |
      {{optimizedCount}}/{{svgCount}} SVG(s) optimized :sparkles:

      {{filesTable}}


# .github/svgo-action.yml
comment: |
  {{optimizedCount}}/{{svgCount}} SVG(s) optimized :sparkles:

  {{filesTable}}
```

---

## Configuration Path

| Name                 | Default Value               | Workflow file      | Config File |
| -------------------- | --------------------------- | ------------------ | ----------- |
| `configuration-path` | `".github/svgo-action.yml"` | :heavy_check_mark: | :x:         |

The _configuration path_ option can be used to change the location of the
[configuration file].

### Examples

To change where the Action looks for a configuration file:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@next
  with:
    configuration-path: path/to/configuration/file.yml
```

---

## Dry run

| Name      | Default Value | Workflow file      | Config File        |
| --------- | ------------- | ------------------ | ------------------ |
| `dry-run` | `false`       | :heavy_check_mark: | :heavy_check_mark: |

The _dry run_ option can be used to run the Action without having it write any
changes. This can be useful for debugging or when you just want to give the
Action a try.

### Examples

To enable the dry-run mode:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@next
  with:
    dry-run: true


# .github/svgo-action.yml
dry-run: true
```

---

## Ignore

| Name     | Default Value | Workflow file      | Config File        |
| -------- | ------------- | ------------------ | ------------------ |
| `ignore` | `""`          | :heavy_check_mark: | :heavy_check_mark: |

The _ignore_ option allows you to specify what files should be ignored by the
Action. By default, no files are ignored. The value is interpreted as a [glob].
Any file that matches the glob will **not** be optimized by the Action.

> :information_source: Regardless of the value of this option, the Action will
> only consider files with the `.svg` file extensions.

### Examples

To ignore all files in a specific folder:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@next
  with:
    ignore: not/optimized/*


# .github/svgo-action.yml
ignore: not/optimized/*
```

To ignore all files in a specific folder and all its subfolders:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@next
  with:
    ignore: not/optimized/**/


# .github/svgo-action.yml
ignore: not/optimized/**/*
```

---

## SVGO Options

| Name           | Default Value      | Workflow file      | Config File        |
| -------------- | ------------------ | ------------------ | ------------------ |
| `svgo-options` | `"svgo.config.js"` | :heavy_check_mark: | :heavy_check_mark: |

The _SVG Options_ option allows you to specify the configuration file for
[SVGO]. This configuration file must be a JavaScript file or in the [YAML]
format. If the specified file is not found the Action will fall back on SVGO's
default configuration.

### Examples

To change the SVGO configuration file:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@next
  with:
    svgo-options: my-svgo-options.js


# .github/svgo-action.yml
svgo-options: my-svgo-options.js
```

---

## SVGO Version

| Name           | Default Value | Workflow file      | Config File        |
| -------------- | ------------- | ------------------ | ------------------ |
| `svgo-version` | `2`           | :heavy_check_mark: | :heavy_check_mark: |

The _SVGO Version_ option allows you to specify the major version of [SVGO] that
you want to use. This can be either `2` for the latest v2.x.x release or `1` for
the latest v1.x.x release.

You need to change this option based on the format of the configuration file for
SVGO that you're using. If you're not yet using [SVGO] v2 you _can_ use this
option to use v1. However, we recommend updating your configuration file
instead. For more information see [the release notes of SVGO
v2](https://github.com/svg/svgo/releases/tag/v2.0.0)

### Examples

To change the SVGO major version to v1.x.x:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@next
  with:
    svgo-version: 1
    svgo-options: .svgo.yml


# .github/svgo-action.yml
svgo-version: 1
svgo-options: .svgo.yml
```

[configuration file]: https://github.com/ericcornelissen/svgo-action#in-another-configuration-file
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[svgo]: https://github.com/svg/svgo
[the templating documentation]: /docs/templating.md
[yaml]: https://yaml.org/
[yaml multiline strings]: https://yaml-multiline.info/
