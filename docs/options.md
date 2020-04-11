# SVGO Action Options

This file contains the documentation for all options for the SVGO Action.

- [Comments](#comments)
- [Commit](#commit)
- [Conventional Commits](#conventional-commits)
- [Dry-run](#dry-run)
- [Ignore](#ignore)
- [SVG Options](#svgo-options)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## Comments

| Name       | Default Value | Workflow file      | Config File        |
|------------|---------------|--------------------|--------------------|
| `comments` | `false`       | :heavy_check_mark: | :heavy_check_mark: |

The _comments_ options can be used to enable comments by the Action on Pull
Requests. The comment by the Action contains a summary of the optimization by
the Action. If the Action did not do anything, it won't leave a comment.

### Examples

To enable comments by the Action:

```yaml
# In a Workflow file
- uses: ericcornelissen/svgo-action@latest
  with:
    comments: true


# In a configuration file
comments: true
```

---

## Commit

| Name     | Default Value | Workflow file | Config File        |
|----------|---------------|---------------|--------------------|
| `commit` | n/a           | :x:           | :heavy_check_mark: |

The _commit_ option can be used to configure the commits created by the Action.
Because it is a complex option, it can only be configured in a configuration
file.

---

## Conventional Commits

The _conventional commits_ option can be used to enable [conventional commit]
message titles for commits.

> :warning: If this option is set to `true`, the _title_ value of the commit
> option will be ignored.

### Examples

To enable conventional commit titles:

```yaml
# In a Workflow file
- uses: ericcornelissen/svgo-action@latest
  with:
    conventional-commits: true


# In a configuration file
conventional-commits: true
```

---

## Dry-run

| Name      | Default Value | Workflow file      | Config File        |
|-----------|---------------|--------------------|--------------------|
| `dry-run` | `false`       | :heavy_check_mark: | :heavy_check_mark: |

The _dry-run_ option can be used to run the Action without having it make any
commits to your repository. This can be useful for debugging or when you just
want to give the Action a try.

### Examples

To enable the dry-run mode:

```yaml
# In a Workflow file
- uses: ericcornelissen/svgo-action@latest
  with:
    dry-run: true


# In a configuration file
dry-run: true
```

---

## Ignore

| Name      | Default Value | Workflow file      | Config File        |
|-----------|---------------|--------------------|--------------------|
| `ignored` | `""`          | :heavy_check_mark: | :heavy_check_mark: |

The _ignore_ option allows you to specify what files should be ignored by the
Action. By default, no files are ignored. The value is interpreted as a [glob].
Any file that matches the glob will **not** be optimized by the Action.

> :information_source: Regardless of the value of this option, the Action will
> only consider files with the `.svg` file extensions.

### Examples

To ignore all files in a specific folder:

```yaml
# In a Workflow file
- uses: ericcornelissen/svgo-action@latest
  with:
    ignore: not/optimized/*


# In a configuration file
ignore: not/optimized/*
```

To ignore all files in a specific folder and all its subfolders:

```yaml
# In a Workflow file
- uses: ericcornelissen/svgo-action@latest
  with:
    ignore: not/optimized/**/


# In a configuration file
ignore: not/optimized/**/*
```

---

## SVG Options

| Name           | Default Value | Workflow file      | Config File        |
|----------------|---------------|--------------------|--------------------|
| `svgo-options` | `".svgo.yml"` | :heavy_check_mark: | :heavy_check_mark: |

The _SVG Options_ option allows you to specify the configuration file for
[SVGO]. This configuration file must be in the [YAML] format. If the specified
file is not found the Action will fall back on SVGO's default configuration.

### Examples

To change the SVGO configuration file:

```yaml
# In a Workflow file
- uses: ericcornelissen/svgo-action@latest
  with:
    svgo-options: my-svgo-options.yml


# In a configuration file
svgo-options: my-svgo-options.yml
```

[conventional commit]: https://www.conventionalcommits.org/en/v1.0.0/
[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new
[SVGO]: https://github.com/svg/svgo
[YAML]: https://yaml.org/
