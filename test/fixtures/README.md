# Fixtures

The fixtures for this project are loosely correlated. I.e., the data in one
fixture file may "point" to data in another file.

## Relations

_'pull-request-payloads.json'_ contains Pull Request payloads as per the [GitHub
API docs]. This includes a field named `filename`. If the `filename` is an .svg
file, then there will be an entry in _'contents-payloads.json'_ for that file,
keyed by the `filename`. This entry contains the Content payload as per the
[GitHub API docs]. Here, the `contents` field contains the file data encoded in
accordance with the encoding specified by the `encoding` field. Lastly,
_'file-data.json'_ contains the (UTF-8 encoded) SVG data of all SVGs  (and some
other files) keyed by the same `filename`.

> :warning: The encoded file data in _'contents-payloads.json'_ should match,
> exactly, the UTF-8 version in _'file-data.json'_.

## Example

Suppose there is a entry in _'pull-request-payloads.json'_ where the `filename`
is "test.svg", then there should be an entry in:

- _'contents-payloads.json'_: keyed by "test.svg" with the corresponding
  content data from GitHub for the file "test.svg".
- _'file-data.json'_: keyed by "test.svg" with the raw file data.


[GitHub API docs]: https://developer.github.com/v3/
