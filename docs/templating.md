# Templating

The Action provides a simple, [Handlebars]-inspired, templating language to
customize commit messages and Pull Request comments. This allows you to
insert variable values from the Action run, such as the number of optimized
SVGs, into these messages.

> :warning: Not all templating variables are available in the commit `title`.

| Name             | Value                                     | Commit Title       | Commit Body        | Comments           |
| ---------------- | ----------------------------------------- | ------------------ | ------------------ | ------------------ |
| `filesList`      | A bullet list of the optimized SVG files  | :x:                | :heavy_check_mark: | :heavy_check_mark: |
| `filesTable`     | A table of optimized files and statistics | :x:                | :heavy_check_mark: | :heavy_check_mark: |
| `ignoredCount`   | The number of ignored SVGs                | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `optimizedCount` | The number of optimized SVGs              | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `skippedCount`   | The number of not-optimized SVGs          | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `svgCount`       | The number of SVGs found in the PR        | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `warnings`       | A list of warnings that occurred          | :x:                | :heavy_check_mark: | :heavy_check_mark: |

It is generally recommended to include `{{warnings}}` in either the commit body
or Pull Request comment as it will alert you about any unexpected issues that
occurred during a run. Note that, if there are no issues, `{{warnings}}` will be
replaced by an empty string. Alternatively, you could rely on GitHub Action Logs
to inform you about the issues that would be reported by `{{warnings}}`.

## Examples

To use templating values in commit messages:

```yaml
# .github/svgo-action.yml

commit:
  title: Optimized {{optimizedCount}}/{{svgCount}} SVG(s)
  body: |
    Namely:
    {{filesList}}

    Details:
    {{svgCount}} SVG(s) in PR, {{optimizedCount}} SVG(s) were
    optimized, {{skippedCount}} SVG(s) already optimized.

    {{warnings}}
```

This will result in commit messages that look like (assuming no warnings):

```git
Optimized 3/4 SVG(s)

Namely:
- foo.svg
- bar.svg
- foobar.svg

Details:
4 SVG(s) in PR, 3 SVG(s) were
optimized, 1 SVG(s) already optimized.
```

To use templating values in Pull Request comments:

```yaml
# .github/svgo-action.yml

comment: |
  {{optimizedCount}} SVG(s) were optimized! Here are some statistics:

  {{filesTable}}

  {{warnings}}
```

This will result in comment that look like (assuming no warnings):

---

3 SVG(s) were optimized! Here are some statistics:

| Filename   | Before   | After    | Improvement |
| ---------- | -------- | -------- | ----------- |
| foo.svg    | 0.862 KB | 0.795 KB | -7.77%      |
| bar.svg    | 0.955 KB | 0.795 KB | -16.75%     |
| foobar.svg | 0.836 KB | 0.795 KB | -4.9%       |

---

[handlebars]: https://handlebarsjs.com/
