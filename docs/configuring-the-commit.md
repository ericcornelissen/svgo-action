# Configuring the Commit

This file documents the `commit` option in detail. This option can be used to
change the commit message for commits produced by the Action.

> :warning: This option can only be configured in a separate configuration file
> and **not** in the Workflow file.

## Configurable options

### Commit Title

The commit title, i.e. the first line of a commit message, can be configured
using the `title` key as shown below. The commit title can be a template string
as described in [commit message templating].

```yaml
# .github/svgo-action.yml

commit:
  title: "This will be the commit message title"
```

This will result in commit messages that look like:

```git
This will be the commit message title

Optimized SVGs:
- foo.svg
- bar.svg
```

### Commit Description

The commit description, i.e. the part of the commit message that comes after the
commit title, can be configured using the `description` key as shown below. The
commit description can be a template string as described in [commit message
templating].

```yaml
# .github/svgo-action.yml

commit:
  description: "This will be the commit message description"
```

This will result in commit messages that look like:

```git
Optimize 42 SVG(s) with SVGO

This will be the commit message description
```

## Commit Message Templating

The Action provides a simple, [Handlebars]-inspired, templating language to
customize the commit message. This allows you to insert variable values from the
Action run, such as the number of optimized SVGs, into the commit message. Note
that not all templating variables are available in the commit `title`.

| Name             | Value                                    | In title | In description |
| ---------------- | ---------------------------------------- | -------- | -------------- |
| `fileCount`      | The number of files found in the PR      | Yes      | Yes            |
| `filesList`      | A bullet list of the optimized SVG files | No       | Yes            |
| `optimizedCount` | The number of optimized SVGs             | Yes      | Yes            |
| `svgCount`       | The number of SVGs found in the PR       | Yes      | Yes            |

### Example

```yaml
# .github/svgo-action.yml

commit:
  title: Optimized {{optimizedCount}} SVG(s)
  description: "Namely:\n{{filesList}}"
```

This will result in commit messages that look like:

```git
Optimized 2 SVG(s)

Namely:
- foo.svg
- bar.svg
```

[commit message templating]: #commit-message-templating
[handlebars]: https://handlebarsjs.com/
