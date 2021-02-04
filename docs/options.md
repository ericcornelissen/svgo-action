# SVGO Action Options

This file contains the documentation for all options for the SVGO Action.

- [Comment](#comment)
- [Commit](#commit)
- [Configuration Path](#configuration-path)
- [Conventional Commits](#conventional-commits)
- [Dry run](#dry-run)
- [Ignore](#ignore)
- [SVGO Options](#svgo-options)

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
- uses: ericcornelissen/svgo-action@v1
  with:
    comment: true


# .github/svgo-action.yml
comment: true
```

To configure the contents of comments by the Action (using [YAML multiline
strings]):

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@v1
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

## Commit

| Name     | Default Value | Workflow file | Config File        |
| -------- | ------------- | ------------- | ------------------ |
| `commit` | `true`        | :x:           | :heavy_check_mark: |

The _commit_ option can be used to either 1) disable commits or 2) configure the
commits created by the Action. Because it is a complex option, it can only be
configured in a configuration file.

- [Disable Commits](#commit-title)
- [Commit Title](#commit-title)
- [Commit Body](#commit-body)

### Disable Commits

To disable commits by the Action:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@v1
  with:
    commit: false


# .github/svgo-action.yml
commit: false
```

### Commit Title

The commit title, i.e. the first line of a commit message, can be configured
using the `title` key as shown below. The commit title can be a template string
as described in [the templating documentation].

```yaml
# .github/svgo-action.yml
commit:
  title: This will be the commit message title
```

This will result in commit messages that look like:

```git
This will be the commit message title

Optimized SVG(s):
- foo.svg
- bar.svg
```

#### Conventional Commit Titles

If you want to use [conventional commit] messages, you can use the
`conventional` key as shown below. This still allows you to configure the commit
message `body`, but the `title` value will be ignored.

> :information_source: This option is also available from the Workflow file
> through the `conventional-commits` option.

```yaml
# .github/svgo-action.yml
commit:
  conventional: true
  title: This will be ignored
  body: You can still configure the commit body
```

This will result in commit messages that look like:

```git
chore: optimize 42 SVG(s)

You can still configure the commit body
```

### Commit Body

The commit body, i.e. the part of the commit message that comes after the commit
title, can be configured using the `body` key as shown below. The commit body
can be a template string as described in [the templating documentation].

```yaml
# .github/svgo-action.yml
commit:
  body: This will be the commit message body
```

This will result in commit messages that look like:

```git
Optimize 42 SVG(s) with SVGO

This will be the commit message body
```

#### Multi-line Commit Body

If you want a commit body that spans multiple lines we recommend using [YAML
multiline strings].

```yaml
# .github/svgo-action.yml
commit:
  body: |
    If you want a commit message that is a
    bit longer and potentially spans multiple
    lines you can use YAML multiline strings.
```

This will result in commit messages that look like:

```git
Optimize 42 SVG(s) with SVGO

If you want a commit message that is a
bit longer and potentially spans multiple
lines you can use YAML multiline strings.
```

#### Omitting the Commit Body

If you prefer the commit body to be omitted, you can simply configure it as an
empty string.

```yaml
# .github/svgo-action.yml
commit:
  body: ""
```

This will result in commit messages that look like:

```git
Optimize 42 SVG(s) with SVGO
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
- uses: ericcornelissen/svgo-action@v1
  with:
    configuration-path: path/to/configuration/file.yml
```

---

## Conventional Commits

| Name                   | Default Value | Workflow file      | Config File |
| ---------------------- | ------------- | ------------------ | ----------- |
| `conventional-commits` | `false`       | :heavy_check_mark: | :x:         |

The _conventional commits_ option can be used to enable [conventional commit]
message titles for commits.

> :warning: If this option is set to `true`, the _title_ value of the `commit`
> option will be ignored.

### Examples

To enable conventional commit titles:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@v1
  with:
    conventional-commits: true
```

---

## Dry run

| Name      | Default Value | Workflow file      | Config File        |
| --------- | ------------- | ------------------ | ------------------ |
| `dry-run` | `false`       | :heavy_check_mark: | :heavy_check_mark: |

The _dry run_ option can be used to run the Action without having it make any
commits to your repository. This can be useful for debugging or when you just
want to give the Action a try.

### Examples

To enable the dry-run mode:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@v1
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
- uses: ericcornelissen/svgo-action@v1
  with:
    ignore: not/optimized/*


# .github/svgo-action.yml
ignore: not/optimized/*
```

To ignore all files in a specific folder and all its subfolders:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@v1
  with:
    ignore: not/optimized/**/


# .github/svgo-action.yml
ignore: not/optimized/**/*
```

---

## SVGO Options

| Name           | Default Value | Workflow file      | Config File        |
| -------------- | ------------- | ------------------ | ------------------ |
| `svgo-options` | `".svgo.yml"` | :heavy_check_mark: | :heavy_check_mark: |

The _SVG Options_ option allows you to specify the configuration file for
[SVGO]. This configuration file must be in the [YAML] format. If the specified
file is not found the Action will fall back on SVGO's default configuration.

### Examples

To change the SVGO configuration file:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@v1
  with:
    svgo-options: my-svgo-options.yml


# .github/svgo-action.yml
svgo-options: my-svgo-options.yml
```

[configuration file]: https://github.com/ericcornelissen/svgo-action#in-another-configuration-file
[conventional commit]: https://www.conventionalcommits.org/
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[svgo]: https://github.com/svg/svgo
[the templating documentation]: /docs/templating.md
[yaml]: https://yaml.org/
[yaml multiline strings]: https://yaml-multiline.info/
