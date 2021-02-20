# Fixtures

The fixtures for this project are loosely correlated. I.e., the data in one
fixture file may "point" to data in another file.

## Relations

_'pull-request-payloads.json'_ contains Pull Request payloads as per the [GitHub
API docs]. This includes a field named `filename`. If the `filename` is an .svg
file, then there will be an entry in _'contents-payloads.json'_ for that file,
keyed by the `filename`. This entry contains the Content payload as per the
[GitHub API docs]. Here, the `contents` field contains the file data encoded in
accordance with the encoding specified by the `encoding` field. Then,
_'file-data.json'_ contains the (UTF-8 encoded) file data of all SVGs (and some
other files) keyed by the same `filename`.

> :warning: The encoded file data in _'contents-payloads.json'_ should match,
> exactly, the UTF-8 version in _'file-data.json'_.

The _'optimizations.json'_ file contains optimized version of the SVGs found in
_'file-data.json'_. The `original` value in _'optimizations.json'_ must match
the value in _'file-data.json'_ if it concerns the same file. The `optimized`
string should be an optimized version of the SVG, and `encoding` should be the
encoding of the optimized version encoded the same way as the subject SVG is
encoded in _'contents-payloads.json'_.

> :warning: The encoded file data in _'optimizations.json'_ should match,
> exactly, the optimized file data in the same file.

The _'svgo-action.json'_ file has a special relation to the file found under
the `filename` "svgo-action.yml". In _'contents-payloads.json'_ this is a [YAML]
file. When "svgo-action.yml" is converted to JSON it should match, exactly, the
JSON data in _'svgo-action.json'_ .

Similarly, the _'svgo-vX-options.json'_ files have a special relation to the
files found under the `filename` ".svgo.yml" and "svgo.config.js". In
_'contents-payloads.json'_ this is a [YAML]/JavaScript file. When ".svgo.yml"/
"svgo.config.js" is converted to JSON it should match, exactly, the JSON data in
_'svgo-vX-options.json'_.

## Example

Suppose there is a entry in _'pull-request-payloads.json'_ where the `filename`
is "test.svg", then there should be an entry in:

- _'contents-payloads.json'_: keyed by "test.svg" with the corresponding
  content data from GitHub for the file "test.svg".
- _'file-data.json'_: keyed by "test.svg" with the raw file data.
- _'optimizations.json'_: with an `original` string equivalent to the raw file
  data in _'file-data.json'_ and corresponding optimization and encoding.

[GitHub API docs]: https://developer.github.com/v3/
[YAML]: https://yaml.org/
