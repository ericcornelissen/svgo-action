# Commit Message Templating

The Action provides a simple, [Handlebars]-inspired, templating language to
customize the commit message. This allows you to insert variable values from the
Action run, such as the number of optimized SVGs, into the commit message. Note
that not all templating variables are available in the commit `title`.

| Name             | Value                                     | In title           | In description     |
| ---------------- | ----------------------------------------- | ------------------ | ------------------ |
| `fileCount`      | The number of files found in the PR       | :heavy_check_mark: | :heavy_check_mark: |
| `filesList`      | A bullet list of the optimized SVG files  | :x:                | :heavy_check_mark: |
| `filesTable`     | A table of optimized files and statistics | :x:                | :heavy_check_mark: |
| `optimizedCount` | The number of optimized SVGs              | :heavy_check_mark: | :heavy_check_mark: |
| `skippedCount`   | The number of not-optimized SVGs          | :heavy_check_mark: | :heavy_check_mark: |
| `svgCount`       | The number of SVGs found in the PR        | :heavy_check_mark: | :heavy_check_mark: |

## Example

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

    Stats:
    {{filesTable}}
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

Stats:| Filename | Before | After | Improvement |
| --- | --- | --- | --- |
| foo.svg | 0.862 KB | 0.795 KB | -7.77% |
| bar.svg | 0.955 KB | 0.795 KB | -16.75% |
| foobar.svg | 0.836 KB | 0.795 KB | -4.9% |
```

[handlebars]: https://handlebarsjs.com/
