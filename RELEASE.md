# Release Guidelines

If you need to release a new version of the SVGO Action you should follow the
guidelines found in this file.

## Outline

The [`release.yml`](./.github/workflows/release.yml) [GitHub Actions] workflow
should be used to create releases. This workflow:

1. Can be [triggered manually] to initiate a new release by means of a Pull
   Request.
1. Is triggered on the `main` branch and will create a [git tag] for the version
   in the manifest **if** it doesn't exist yet. This will also keep the `v3`
   branch up-to-date.

The release process is as follows:

1. Initiate a new release by triggering the `release.yml` workflow manually. Use
   an update type in accordance with [Semantic Versioning].
1. Review the created Pull Request and make sure the changes look OK. Make
   changes if necessary, for example for major releases. Merge the Pull Request
   when the release is ready. After merging, a [git tag] for the new version
   will be created automatically.
1. Create a new [GitHub Release] for the (automatically) created tag. If the
   version should be published to the [GitHub Marketplace] ensure that checkbox
   is checked.

### Non-current Releases

See the Release Guidelines (`RELEASE.md`) of the respective main branch.

### Major Releases

In case the release is a major release, some additional steps need to be carried
out:

1. Ensure any references to the major version in the documentation are updated.
1. Update the automated release workflow to create releases for the new major
   version.

Make sure these additional changes are included in the release.

## Manual Releases (Discouraged)

If it's not possible to use automated releases, or if something goes wrong with
the automatic release process, you can follow these steps to release a new
version (using `v3.1.4` as an example):

1. Make sure that your local copy of the repository is up-to-date. Either sync:

   ```sh
   git checkout main
   git pull origin main
   ```

   Or use a fresh clone:

   ```sh
   git clone git@github.com:ericcornelissen/svgo-action.git
   ```

1. Verify that the repository is in a state that can be released:

   ```sh
   npm clean-install
   npm run lint
   npm run coverage:all
   npm run build
   ```

1. Update the contents of the `lib/` directory using:

   ```sh
   npm run build
   ```

1. Update the version number in the package manifest and lockfile:

   ```sh
   npm version --no-git-tag-version v3.1.4
   ```

   If that fails change the value of the version field in `package.json` to the
   new version:

   ```diff
   -  "version": "2.7.0",
   +  "version": "3.1.4",
   ```

   and to update the version number in `package-lock.json` it is recommended to
   run `npm install` (after updating `package.json`) which will sync the version
   number.

1. Update the changelog:

   ```sh
   node script/bump-changelog.js
   ```

   If that fails, manually add the following text after the `## [Unreleased]`
   line:

   ```md
   - _No changes yet_

   ## [3.1.4] - YYYY-MM-DD
   ```

   The date should follow the year-month-day format where single-digit months
   and days should be prefixed with a `0` (e.g. `2022-01-01`).

1. Commit the changes to a release branch and push using:

   ```sh
   git checkout -b v3-release-candidate
   git add lib/ CHANGELOG.md package.json package-lock.json
   git commit --no-verify -m "Version bump"
   git push origin v3-release-candidate
   ```

   (The `--no-verify` option is required to commit the changes in `lib/`.)

1. Create a Pull Request to merge `v3-release-candidate` into `main`. Merge the
   Pull Request if the changes look OK and all CI checks are passing.

1. After the Pull Request is merged, sync the `main` branch:

   ```sh
   git checkout main
   git pull origin main
   ```

   Create a tag for the new version:

   ```sh
   git tag v3.1.4
   ```

   And update the commit that the `v3` branch points to:

   ```sh
   git checkout v3
   git merge main
   ```

1. Push the `v3` branch and new tag:

   ```sh
   git push origin v3 v3.1.4
   ```

1. Create a new [GitHub Release]. If the version should be published to the
   [GitHub Marketplace] ensure that checkbox is checked.

[git tag]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
[github actions]: https://github.com/features/actions
[github marketplace]: https://github.com/marketplace
[github release]: https://github.com/ericcornelissen/svgo-action/releases
[semantic versioning]: https://semver.org/spec/v2.0.0.html
[triggered manually]: https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow
