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
  title: This will be the commit message title
```

This will result in commit messages that look like:

```git
This will be the commit message title

Optimized SVG(s):
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
  description: This will be the commit message description
```

This will result in commit messages that look like:

```git
Optimize 42 SVG(s) with SVGO

This will be the commit message description
```

#### Multi-line Descriptions

If you want a commit desciption that spans multiple lines we recommend using
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

### Conventional Commits

If you want to use [conventional commit] messages, you can use `conventional`
key as shown below. This still allows you to configure the commit message
`description`. The `title` value will be ignored.

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
| `skippedCount`   | The number of not-optimized SVGs         | Yes      | Yes            |
| `svgCount`       | The number of SVGs found in the PR       | Yes      | Yes            |

### Example

```yaml
# .github/svgo-action.yml

commit:
  title: Optimized {{optimizedCount}}/{{svgCount}} SVG(s)
  description: |
    Namely:
    {{filesList}}

    Details:
    {{fileCount}} file(s) in PR, {{svgCount}} SVG(s),
    {{skippedCount}} SVG(s) already optimized
```

This will result in commit messages that look like:

```git
Optimized 3/4 SVG(s)

Namely:
- foo.svg
- bar.svg
- foobar.svg

Details:
5 file(s) in PR, 4 SVG(s),
1 SVG(s) already optimized
```

[commit message templating]: #commit-message-templating
[yaml multiline strings]: https://yaml-multiline.info/
[conventional commit]: https://www.conventionalcommits.org/en/v1.0.0/
[handlebars]: https://handlebarsjs.com/
