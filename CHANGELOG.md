# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to [Semantic
Versioning].

## [Unreleased]

- _No changes yet_

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
