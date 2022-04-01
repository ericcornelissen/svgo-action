# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to [Semantic
Versioning].

## [Unreleased]

- Replace dependency `node-eval` by `eval`. ([#536])

## [3.0.0] - 2022-03-31

### Breaking changes

- Drop **built-in** support for SVGO v1. ([#521], [#535])
- Update Node.js runtime to v16. ([#526])

### Changes

- Update versions of recommended Actions in examples. ([#532])

## [2.1.6] - 2022-03-31

- Add deprecation warning recommending switching to v3 of this Action. ([#524])
- Update dependency `minimatch`. ([#510])
- Use file handles when reading and writing files. ([#518])

## [2.1.5] - 2022-01-27

- (Security) Update dependency `node-fetch` to non-vulnerable version. ([#506])

## [2.1.4] - 2022-01-13

- Specify permissions in documentation. ([#486])
- Improve clarity of example workflows in documentation. ([#486])
- Improve logging. ([#498])

## [2.1.3] - 2021-11-02

- Update SVGO v2 to `v2.8.0`. ([#481])

## [2.1.2] - 2021-10-18

- Add deprecation warning annotation when using SVGO v1. ([#466])
- Support using project-specific SVGO. ([#464])

## [2.1.1] - 2021-10-03

- Run on any event when not in strict mode. ([#454], [#459])
- Run with invalid SVGO config file when not in strict mode. ([#457])

## [2.1.0] - 2021-09-25

- Add a strict mode. ([#436])
- Add output definitions to the Action manifest. ([#445])
- Update SVGO v2 to `v2.7.0`. ([#446])

## [2.0.6] - 2021-09-22

- Fix bug when the `dry-run` value is invalid. ([#439])
- Remove "SVGO config file not found" warning if it's not configured. ([#432])

## [2.0.5] - 2021-09-17

- Update SVGO v2 to `v2.6.1`. ([#430])

## [2.0.4] - 2021-09-14

- Fix bug when the `dry-run` value is invalid. ([#413])
- Improve multiline support for ignore globs. ([#420])
- Fix mistake in the Pull Request example workflow. ([#424])
- Update SVGO v2 to `v2.6.0`. ([#427])

## [2.0.3] - 2021-08-28

- Add support for multiple ignore globs. ([#405])
- Update SVGO v2 to `v2.5.0`. ([#410])

## [2.0.2] - 2021-08-23

- Update SVGO v2 to `v2.4.0`. ([#406])

## [2.0.1] - 2021-08-14

- Don't require `repo-token` in scheduled and dispatched events. ([#396])
- Change `svgo-config` default based on `svgo-version` value. ([#400], [#402])
- Add `repo-token` where missing to the documentation. ([#401])

## [2.0.0] - 2021-08-01

### Breaking changes

- Now operates on local clone of the repository.
- Remove ability to commit changes. ([#357])
- Remove ability to create Pull Request comments. ([#357])
- Remove ability to cancel runs. ([#357])
- Remove support for an external configuration file. ([#358])
- Rename `svgo-options` input to `svgo-config`. ([64d0e89])
- Remove branch configuration option for scheduled runs.
- Remove `SKIPPED_COUNT` output. ([#364])

### Changes

- Don't count already optimized SVGs in `OPTIMIZED_COUNT` output. ([#363])

## [1.3.14] - 2022-03-31

- Update deprecation notice to recommend switching to v3. ([#525])

## [1.3.13] - 2022-01-27

- (Security) Update dependency `node-fetch` to non-vulnerable version. ([#505])

## [1.3.12] - 2021-11-02

- Update SVGO v2 to `v2.8.0`. ([#480])

## [1.3.11] - 2021-10-18

- Add deprecation warning annotation when using SVGO v1. ([#469])

## [1.3.10] - 2021-09-25

- Add output definitions to the Action manifest. ([#449])
- Update SVGO v2 to `v2.7.0`. ([#448])

## [1.3.9] - 2021-09-17

- Update SVGO v2 to `v2.6.1`. ([#429])

## [1.3.8] - 2021-09-13

- Update SVGO v2 to `v2.6.0`. ([#426])

## [1.3.7] - 2021-08-30

- Update SVGO v2 to `v2.5.0`. ([#411])

## [1.3.6] - 2021-08-23

- Update SVGO v2 to `v2.4.0`. ([#407])

## [1.3.5] - 2021-07-21

- Fix ignored SVGO v2 configuration files. ([#380])

## [1.3.4] - 2021-06-27

- Update SVGO v2 to `v2.3.1`.
- Add warning about running the Action for Pull Requests from forks. ([#355])
- Allow more values for boolean options. ([#371])

## [1.3.3] - 2021-04-02

- Update SVGO v2 to `v2.3.0`. ([#352])

## [1.3.2] - 2021-03-08

- Update SVGO v2 to `v2.2.1`. ([#344])

## [1.3.1] - 2021-03-02

- Fix documentation of supported inputs for on: push events. ([#335])
- Run Action on `repository_dispatch` & `workflow_dispatch`. ([#339])
- Update SVGO v2 to `v2.2.0`. ([#337])

## [1.3.0] - 2021-02-21

- Add support for using SVGO v2. ([#330])
- Add support for JavaScript based SVGO configuration files. ([#330])

## [1.2.3] - 2021-02-10

- Prevent GitHub Actions warning about `ignore` input. ([#327])

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

- Add `dry-run` option for the action. ([#77])
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
[#312]: https://github.com/ericcornelissen/svgo-action/pull/312
[#317]: https://github.com/ericcornelissen/svgo-action/pull/317
[#321]: https://github.com/ericcornelissen/svgo-action/pull/321
[#327]: https://github.com/ericcornelissen/svgo-action/pull/327
[#330]: https://github.com/ericcornelissen/svgo-action/pull/330
[#335]: https://github.com/ericcornelissen/svgo-action/pull/335
[#337]: https://github.com/ericcornelissen/svgo-action/pull/337
[#339]: https://github.com/ericcornelissen/svgo-action/pull/339
[#343]: https://github.com/ericcornelissen/svgo-action/pull/343
[#344]: https://github.com/ericcornelissen/svgo-action/pull/344
[#346]: https://github.com/ericcornelissen/svgo-action/pull/346
[#352]: https://github.com/ericcornelissen/svgo-action/pull/352
[#355]: https://github.com/ericcornelissen/svgo-action/pull/355
[#357]: https://github.com/ericcornelissen/svgo-action/pull/357
[#358]: https://github.com/ericcornelissen/svgo-action/pull/358
[#363]: https://github.com/ericcornelissen/svgo-action/pull/363
[#364]: https://github.com/ericcornelissen/svgo-action/pull/364
[#371]: https://github.com/ericcornelissen/svgo-action/pull/371
[#380]: https://github.com/ericcornelissen/svgo-action/pull/380
[#396]: https://github.com/ericcornelissen/svgo-action/pull/396
[#400]: https://github.com/ericcornelissen/svgo-action/pull/400
[#401]: https://github.com/ericcornelissen/svgo-action/pull/401
[#402]: https://github.com/ericcornelissen/svgo-action/pull/402
[#405]: https://github.com/ericcornelissen/svgo-action/pull/405
[#406]: https://github.com/ericcornelissen/svgo-action/pull/406
[#407]: https://github.com/ericcornelissen/svgo-action/pull/407
[#410]: https://github.com/ericcornelissen/svgo-action/pull/410
[#411]: https://github.com/ericcornelissen/svgo-action/pull/411
[#413]: https://github.com/ericcornelissen/svgo-action/pull/413
[#420]: https://github.com/ericcornelissen/svgo-action/pull/420
[#424]: https://github.com/ericcornelissen/svgo-action/pull/424
[#426]: https://github.com/ericcornelissen/svgo-action/pull/426
[#427]: https://github.com/ericcornelissen/svgo-action/pull/427
[#429]: https://github.com/ericcornelissen/svgo-action/pull/429
[#430]: https://github.com/ericcornelissen/svgo-action/pull/430
[#432]: https://github.com/ericcornelissen/svgo-action/pull/432
[#436]: https://github.com/ericcornelissen/svgo-action/pull/436
[#439]: https://github.com/ericcornelissen/svgo-action/pull/439
[#445]: https://github.com/ericcornelissen/svgo-action/pull/445
[#446]: https://github.com/ericcornelissen/svgo-action/pull/446
[#448]: https://github.com/ericcornelissen/svgo-action/pull/448
[#449]: https://github.com/ericcornelissen/svgo-action/pull/449
[#454]: https://github.com/ericcornelissen/svgo-action/pull/454
[#457]: https://github.com/ericcornelissen/svgo-action/pull/457
[#459]: https://github.com/ericcornelissen/svgo-action/pull/459
[#464]: https://github.com/ericcornelissen/svgo-action/pull/464
[#466]: https://github.com/ericcornelissen/svgo-action/pull/466
[#469]: https://github.com/ericcornelissen/svgo-action/pull/469
[#480]: https://github.com/ericcornelissen/svgo-action/pull/480
[#481]: https://github.com/ericcornelissen/svgo-action/pull/481
[#486]: https://github.com/ericcornelissen/svgo-action/pull/486
[#498]: https://github.com/ericcornelissen/svgo-action/pull/498
[#505]: https://github.com/ericcornelissen/svgo-action/pull/505
[#506]: https://github.com/ericcornelissen/svgo-action/pull/506
[#510]: https://github.com/ericcornelissen/svgo-action/pull/510
[#518]: https://github.com/ericcornelissen/svgo-action/pull/518
[#521]: https://github.com/ericcornelissen/svgo-action/pull/521
[#524]: https://github.com/ericcornelissen/svgo-action/pull/524
[#525]: https://github.com/ericcornelissen/svgo-action/pull/525
[#526]: https://github.com/ericcornelissen/svgo-action/pull/526
[#532]: https://github.com/ericcornelissen/svgo-action/pull/532
[#535]: https://github.com/ericcornelissen/svgo-action/pull/535
[#536]: https://github.com/ericcornelissen/svgo-action/pull/536
[64d0e89]: https://github.com/ericcornelissen/svgo-action/commit/64d0e8958d462695b3939588707815182ecc3690
[8d8f516]: https://github.com/ericcornelissen/svgo-action/commit/8d8f516583b4340f692e2ea80e1855e5a1211bd3
