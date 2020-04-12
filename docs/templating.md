# Templating

The Action provides a simple, [Handlebars]-inspired, templating language to
customize commit messages and Pull Request comments. This allows you to
insert variable values from the Action run, such as the number of optimized
SVGs, into these messages.

> :warning: Not all templating variables are available in the commit `title`.

| Name             | Value                                     | Commit Title       | Commit Body        | Comments           |
| ---------------- | ----------------------------------------- | ------------------ | ------------------ | ------------------ |
| `fileCount`      | The number of files found in the PR       | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `filesList`      | A bullet list of the optimized SVG files  | :x:                | :heavy_check_mark: | :heavy_check_mark: |
| `filesTable`     | A table of optimized files and statistics | :x:                | :heavy_check_mark: | :heavy_check_mark: |
| `optimizedCount` | The number of optimized SVGs              | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `skippedCount`   | The number of not-optimized SVGs          | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| `svgCount`       | The number of SVGs found in the PR        | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |

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

To use templating values in Pull Request comments:

```yaml
# .github/svgo-action.yml

comment: |
  {{optimizedCount}} SVG(s) were optimized! Here are some statistics:

  {{filesTable}}
```

This will result in comment that look like:

---

3 SVG(s) were optimized! Here are some statistics:

| Filename   | Before   | After    | Improvement |
| ---------- | -------- | -------- | ----------- |
| foo.svg    | 0.862 KB | 0.795 KB | -7.77%      |
| bar.svg    | 0.955 KB | 0.795 KB | -16.75%     |
| foobar.svg | 0.836 KB | 0.795 KB | -4.9%       |

---

[handlebars]: https://handlebarsjs.com/
