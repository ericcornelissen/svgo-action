# SVGO Action Options

This file contains the documentation for all options for the SVGO Action.

- [Comments](#comments)
- [Commit](#commit)
- [Conventional Commits](#conventional-commits)
- [Dry-run](#dry-run)
- [Ignore](#ignore)
- [SVGO Options](#svgo-options)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## Comments

| Name       | Default Value | Workflow file      | Config File        |
| ---------- | ------------- | ------------------ | ------------------ |
| `comments` | `false`       | :heavy_check_mark: | :heavy_check_mark: |

The _comments_ options can be used to enable comments by the Action on Pull
Requests. The comment by the Action contains a summary of the optimization by
the Action. If the Action did not do anything, it won't leave a comment.

### Examples

To enable comments by the Action:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@latest
  with:
    comments: true


# .github/svgo-action.yml
comments: true
```

---

## Commit

| Name     | Default Value | Workflow file | Config File        |
| -------- | ------------- | ------------- | ------------------ |
| `commit` | n/a           | :x:           | :heavy_check_mark: |

The _commit_ option can be used to configure the commits created by the Action.
Because it is a complex option, it can only be configured in a configuration
file.

- [Commit Title](#commit-title)
- [Commit Description](#commit-description)

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
message `description`, but the `title` value will be ignored.

> :information_source: This option is also available from the Workflow file
> through the `conventional-commits` option.

```yaml
# .github/svgo-action.yml

commit:
  conventional: true
  title: This will be ignored
  description: You can still configure the commit description
```

This will result in commit messages that look like:

```git
chore: optimize 42 SVG(s)

You can still configure the commit description
```

### Commit Description

The commit description, i.e. the part of the commit message that comes after the
commit title, can be configured using the `description` key as shown below. The
commit description can be a template string as described in [the templating
documentation].

```yaml
# .github/svgo-action.yml

commit:
  description: This will be the commit message description
```

This will result in commit messages that look like:

```git
Optimize 42 SVG(s) with SVGO

This will be the commit message description
```

#### Multi-line Descriptions

If you want a commit description that spans multiple lines we recommend using
[YAML multiline strings].

```yaml
# .github/svgo-action.yml

commit:
  description: |
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

#### Omitting the Description

If you prefer the commit description to be omitted, you can simply configure it
as an empty string.

```yaml
# .github/svgo-action.yml

commit:
  description: ""
```

This will result in commit messages that look like:

```git
Optimize 42 SVG(s) with SVGO
```

---

## Conventional Commits

The _conventional commits_ option can be used to enable [conventional commit]
message titles for commits.

> :warning: If this option is set to `true`, the _title_ value of the `commit`
> option will be ignored.

### Examples

To enable conventional commit titles:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@latest
  with:
    conventional-commits: true


# .github/svgo-action.yml
conventional-commits: true
```

---

## Dry-run

| Name      | Default Value | Workflow file      | Config File        |
| --------- | ------------- | ------------------ | ------------------ |
| `dry-run` | `false`       | :heavy_check_mark: | :heavy_check_mark: |

The _dry-run_ option can be used to run the Action without having it make any
commits to your repository. This can be useful for debugging or when you just
want to give the Action a try.

### Examples

To enable the dry-run mode:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@latest
  with:
    dry-run: true


# .github/svgo-action.yml
dry-run: true
```

---

## Ignore

| Name      | Default Value | Workflow file      | Config File        |
| --------- | ------------- | ------------------ | ------------------ |
| `ignored` | `""`          | :heavy_check_mark: | :heavy_check_mark: |

The _ignore_ option allows you to specify what files should be ignored by the
Action. By default, no files are ignored. The value is interpreted as a [glob].
Any file that matches the glob will **not** be optimized by the Action.

> :information_source: Regardless of the value of this option, the Action will
> only consider files with the `.svg` file extensions.

### Examples

To ignore all files in a specific folder:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@latest
  with:
    ignore: not/optimized/*


# .github/svgo-action.yml
ignore: not/optimized/*
```

To ignore all files in a specific folder and all its subfolders:

```yaml
# .github/workflows/svgo.yml
- uses: ericcornelissen/svgo-action@latest
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
- uses: ericcornelissen/svgo-action@latest
  with:
    svgo-options: my-svgo-options.yml


# .github/svgo-action.yml
svgo-options: my-svgo-options.yml
```

[conventional commit]: https://www.conventionalcommits.org/
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new
[svgo]: https://github.com/svg/svgo
[the templating documentation]: /docs/templating.md
[yaml]: https://yaml.org/
[yaml multiline strings]: https://yaml-multiline.info/
