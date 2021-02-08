# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to [Semantic
Versioning].

## [Unreleased]

- Run Action on `pull_request_target`. ([#309])

## [1.2.2] - 2021-02-08

- Allow scheduled runs on any branch. ([#321])

## [1.2.1] - 2021-02-05

- Output basic information about the Action run. ([#312])
- Update project description. ([#317])

## [1.2.0] - 2020-10-03

- Run Action on schedule. ([#262])
- Improve README. ([#270])
- Document behavior for each supported event. ([#272])

## [1.1.2] - 2020-09-23

- Add warnings to commit messages and Pull Request comments. ([#258])
- Fix mistake in configuration path documentation. ([8d8f516])

## [1.1.1] - 2020-09-11

- Improve options documentation. ([#251])
- Update `node-fetch` from v2.6.0 to v2.6.1 ([#255])

## [1.1.0] - 2020-09-02

- Run Action on push events. ([#236])
- Update `@actions/core` from v1.2.4 to v1.2.5 ([#245])
- Fix the URL for the "Creating a Workflow file" link in the README. ([#247])

## [1.0.2] - 2020-08-21

- Skip large files. ([#239])
- Update `js-yaml` from v3.13.1 to v3.14.0 ([#207])
- Update `@actions/github` from 2.2.0 to 4.0.0 ([#223])

## [1.0.1] - 2020-04-30

- Update `@actions/http-client` from v1.0.6 to v1.0.8 ([#199])

## [1.0.0] - 2020-04-14

- (!) Rename the `comments` option to `comment`. ([#190])
- (!) Rename the `commit.description` options to `commit.body`. ([#190])
- Add `ignoredCount` as templating variable. ([#191])

## [0.4.4] - 2020-04-12

- Add functionality to ignore SVGs based on a glob. ([#175], [#179])
- Add option to customize Pull Request comments. ([#184], [#186])
- Update the documentation for the Action's options. ([#185])
- Add the files table template value for commit message bodies. ([#187])

## [0.4.3] - 2020-04-10

- Fix bug in the Pull Request comment when not all SVG are optimized. ([#178])

## [0.4.2] - 2020-04-09

- Add functionality to comment on Pull Requests. ([#164], [#170])

## [0.4.1] - 2020-04-05

- Fix bug for SVG files not containing an SVG. ([#160])
- Improve logging. ([#157])

## [0.4.0] - 2020-03-14

- Add `skippedCount` as templating variable. ([#132])
- Re-enable the Action from a commit message. ([#133])

## [0.3.2] - 2020-03-13

- Re-enable the Action from a Pull Request comment. ([#129])
- Fix the default commit message body. ([#130])

## [0.3.1] - 2020-03-12

- Add `fileCount` and `svgCount` as templating variable. ([#122])
- Add option to use conventional commit message titles. ([#124])

## [0.3.0] - 2020-03-08

- Disable the action from a Pull Request comment. ([#106])
- Add log message when no SVGs are added or changed. ([#111])
- Make the commit message configurable. ([#112])

## [0.2.2] - 2020-03-02

- Configure the SVGO options file. ([#99])
- Fix `required` value for "configuration-path" input. ([#100])
- Fix interpretation of "dry-run" input in config file. ([#103])
- Fix documentation for configuration in config file. ([#108])

## [0.2.1] - 2020-03-02

- Disable the action from a commit message. ([#91])
- Add support for a separate configuration file. ([#92])
- Improve the default commit message. ([#97])

## [0.2.0] - 2020-03-01

- Commit all optimization in a single commit. ([#84])

## [0.1.2] - 2020-02-24

- Add `dry-run` option for the action.  ([#77])
- Specify `required` for action inputs. ([#78])
- Add informative logging. ([#81])

## [0.1.1] - 2020-02-20

- Don't commit changes for already optimized SVGs. ([#69])
- Update Action metadata. ([#61], [#62])

## [0.1.0] - 2020-02-18

- Run SVGO on SVGs in a Pull Request and commit the optimizations back. ([#13])
- Use SVGO configuration file (`.svgo.yml`) found in the repository. ([#54])
- Limited error logging on failures. ([#52])
- Simplistic documentation in the `README.md`. ([#56])

[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html
[#13]: https://github.com/ericcornelissen/svgo-action/issues/13
[#52]: https://github.com/ericcornelissen/svgo-action/pull/52
[#54]: https://github.com/ericcornelissen/svgo-action/pull/54
[#56]: https://github.com/ericcornelissen/svgo-action/pull/56
[#61]: https://github.com/ericcornelissen/svgo-action/pull/61
[#62]: https://github.com/ericcornelissen/svgo-action/pull/62
[#69]: https://github.com/ericcornelissen/svgo-action/pull/69
[#77]: https://github.com/ericcornelissen/svgo-action/pull/77
[#78]: https://github.com/ericcornelissen/svgo-action/pull/78
[#81]: https://github.com/ericcornelissen/svgo-action/pull/81
[#84]: https://github.com/ericcornelissen/svgo-action/pull/84
[#91]: https://github.com/ericcornelissen/svgo-action/pull/91
[#92]: https://github.com/ericcornelissen/svgo-action/pull/92
[#97]: https://github.com/ericcornelissen/svgo-action/pull/97
[#99]: https://github.com/ericcornelissen/svgo-action/pull/99
[#100]: https://github.com/ericcornelissen/svgo-action/pull/100
[#103]: https://github.com/ericcornelissen/svgo-action/pull/103
[#106]: https://github.com/ericcornelissen/svgo-action/pull/106
[#108]: https://github.com/ericcornelissen/svgo-action/pull/108
[#111]: https://github.com/ericcornelissen/svgo-action/pull/111
[#112]: https://github.com/ericcornelissen/svgo-action/pull/112
[#122]: https://github.com/ericcornelissen/svgo-action/pull/122
[#124]: https://github.com/ericcornelissen/svgo-action/pull/124
[#129]: https://github.com/ericcornelissen/svgo-action/pull/129
[#130]: https://github.com/ericcornelissen/svgo-action/pull/130
[#132]: https://github.com/ericcornelissen/svgo-action/pull/132
[#133]: https://github.com/ericcornelissen/svgo-action/pull/133
[#157]: https://github.com/ericcornelissen/svgo-action/pull/157
[#160]: https://github.com/ericcornelissen/svgo-action/pull/160
[#164]: https://github.com/ericcornelissen/svgo-action/pull/164
[#170]: https://github.com/ericcornelissen/svgo-action/pull/170
[#175]: https://github.com/ericcornelissen/svgo-action/pull/175
[#178]: https://github.com/ericcornelissen/svgo-action/pull/178
[#179]: https://github.com/ericcornelissen/svgo-action/pull/179
[#184]: https://github.com/ericcornelissen/svgo-action/pull/184
[#185]: https://github.com/ericcornelissen/svgo-action/pull/185
[#186]: https://github.com/ericcornelissen/svgo-action/pull/186
[#187]: https://github.com/ericcornelissen/svgo-action/pull/187
[#190]: https://github.com/ericcornelissen/svgo-action/pull/190
[#191]: https://github.com/ericcornelissen/svgo-action/pull/191
[#199]: https://github.com/ericcornelissen/svgo-action/pull/199
[#207]: https://github.com/ericcornelissen/svgo-action/pull/207
[#223]: https://github.com/ericcornelissen/svgo-action/pull/223
[#236]: https://github.com/ericcornelissen/svgo-action/pull/236
[#239]: https://github.com/ericcornelissen/svgo-action/pull/239
[#245]: https://github.com/ericcornelissen/svgo-action/pull/245
[#247]: https://github.com/ericcornelissen/svgo-action/pull/247
[#251]: https://github.com/ericcornelissen/svgo-action/pull/251
[#255]: https://github.com/ericcornelissen/svgo-action/pull/255
[#258]: https://github.com/ericcornelissen/svgo-action/pull/258
[#262]: https://github.com/ericcornelissen/svgo-action/pull/262
[#270]: https://github.com/ericcornelissen/svgo-action/pull/270
[#272]: https://github.com/ericcornelissen/svgo-action/pull/272
[#309]: https://github.com/ericcornelissen/svgo-action/pull/309
[#312]: https://github.com/ericcornelissen/svgo-action/pull/312
[#317]: https://github.com/ericcornelissen/svgo-action/pull/317
[#321]: https://github.com/ericcornelissen/svgo-action/pull/321
[8d8f516]: https://github.com/ericcornelissen/svgo-action/commit/8d8f516583b4340f692e2ea80e1855e5a1211bd3
