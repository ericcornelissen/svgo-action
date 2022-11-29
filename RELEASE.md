# Release Guidelines

If you need to release a new version of the _SVGO Action_, follow the guidelines
found in this document.

- [Automated Releases (Preferred)](#automated-releases-preferred)
- [Manual Releases (Discouraged)](#manual-releases-discouraged)
- [Creating a GitHub Release](#creating-a-github-release)
- [Major Releases](#major-releases)
- [Non-current Releases](#non-current-releases)

## Automated Releases (Preferred)

To release a new version follow these steps:

1. [Manually trigger] the [release workflow] from the `main` branch; Use an
   update type in accordance with [Semantic Versioning]. This will create a Pull
   Request that start the release process.
1. Follow the instructions in the description of the created Pull Request.

## Manual Releases (Discouraged)

If it's not possible to use automated releases, or if something goes wrong with
the automatic release process, you can follow these steps to release a new
version (using `v3.1.4` as an example):

1. Make sure that your local copy of the repository is up-to-date. Either sync:

   ```shell
   git checkout main
   git pull origin main
   ```

   Or use a fresh clone:

   ```shell
   git clone git@github.com:ericcornelissen/svgo-action.git
   ```

1. Update the contents of the `lib/` directory using:

   ```shell
   npm run build
   ```

1. Update the version number in the package manifest and lockfile:

   ```shell
   npm version --no-git-tag-version v3.1.4
   ```

   If that fails, change the value of the version field in `package.json` to the
   new version:

   ```diff
   -  "version": "3.1.3",
   +  "version": "3.1.4",
   ```

   and update the version number in `package-lock.json` using `npm install`
   (after updating `package.json`), which will sync the version number.

1. Update the changelog:

   ```shell
   node script/bump-changelog.js
   ```

   If that fails, manually add the following text after the `## [Unreleased]`
   line:

   ```markdown
   - _No changes yet_

   ## [3.1.4] - YYYY-MM-DD
   ```

   The date should follow the year-month-day format where single-digit months
   and days should be prefixed with a `0` (e.g. `2022-01-01`).

1. Commit the changes to a new release branch and push using:

   ```shell
   git checkout -b release-$(sha1sum package-lock.json | awk '{print $1}')
   git add lib/ CHANGELOG.md package.json package-lock.json
   git commit --no-verify --message "chore: version bump"
   git checkout -b release-$(sha1sum package-lock.json | awk '{print $1}')
   ```

   The `--no-verify` option is required to commit the changes in `lib/`.

1. Create a Pull Request to merge the release branch into `main`.

1. Merge the Pull Request if the changes look OK and all continuous integration
   checks are passing.

   > **Note** At this point, the continuous delivery automation may pick up and
   > complete the release process. Check whether or not this happens. If no, or
   > only partially, continue following the remaining steps.

1. Immediately after the Pull Request is merged, sync the `main` branch:

   ```shell
   git checkout main
   git pull origin main
   ```

1. Create a [git tag] for the new version:

   ```shell
   git tag v3.1.4
   ```

1. Update the `v3` branch to point to the same commit as the new tag:

   ```shell
   git checkout v3
   git merge main
   ```

1. Push the `v3` branch and new tag:

   ```shell
   git push origin v3 v3.1.4
   ```

1. [Create a GitHub Release].

## Creating a GitHub Release

Create a new [GitHub Release] for the [git tag] of the new release. The release
title should be "Release {_version_}" (e.g. "Release v3.1.4"). The release text
should be the changes from the [changelog] for the version (including links).

Ensure the version is published to the [GitHub Marketplace] as well.

## Major Releases

For major releases, some additional steps are required. This may include:

- Ensure any references to the major version in the documentation (external and
  internal) are updated.
- Update the automated release workflow to create releases for the new major
  version.
- Update the issue templates to align with the new major version.

Make sure these additional changes are included in the release Pull Request.

## Non-current Releases

When releasing an older version of the project, refer to the Release Guidelines
(`RELEASE.md`) of the respective main branch instead.

[changelog]: ./CHANGELOG.md
[create a gitHub release]: #creating-a-github-release
[git tag]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
[github marketplace]: https://github.com/marketplace
[github release]: https://github.com/ericcornelissen/svgo-action/releases
[manually trigger]: https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow
[release workflow]: ./.github/workflows/release.yml
[semantic versioning]: https://semver.org/spec/v2.0.0.html
