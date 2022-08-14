# Release Guidelines

If you need to release a new version of the SVGO Action v1 you should follow the
guidelines found in this file.

## Outline

A typical release process for v1 versions will look something like this (using
`v1.6.1` as an example):

1. Make sure that your local copy of the repository is up-to-date:

   ```sh
   # Sync
   git switch main-v1
   git pull origin main-v1

   # Or clone
   git clone git@github.com:ericcornelissen/svgo-action.git
   git switch main-v1
   ```

1. Verify that the repository is in a state that can be released:

   ```sh
   npm clean-install
   npm run lint
   npm run test:coverage
   npm run build
   ```

1. Follow [Semantic Versioning] rules to determine the next version number.
   Update the version number in the package manifest and lockfile:

   ```sh
   npm version --no-git-tag-version v1.6.1
   ```

   If that fails change the value of the version field in `package.json` to the
   new version:

   ```diff
   -  "version": "1.6.0",
   +  "version": "1.6.1",
   ```

   and to update the version number in `package-lock.json` it is recommended to
   run `npm install` (after updating `package.json`) which will sync the version
   number.

1. Update the changelog by adding the following text after the `## [Unreleased]`
   line:

   ```md
   - _No changes yet_

   ## [1.6.1] - YYYY-MM-DD
   ```

   The date should follow the year-month-day format where single-digit months
   and days should be prefixed with a `0` (e.g. `2022-01-01`).

1. Update the README by updating the links for the Marketplace badge to the new
   version:

   ```diff
   - [marketplace-url]: https://github.com/marketplace/actions/svgo-action?version=v1.6.0
   - [marketplace-image]: https://img.shields.io/badge/Marketplace-1.6.0-undefined.svg?logo=github&logoColor=white&style=flat
   + [marketplace-url]: https://github.com/marketplace/actions/svgo-action?version=v1.6.1
   + [marketplace-image]: https://img.shields.io/badge/Marketplace-1.6.1-undefined.svg?logo=github&logoColor=white&style=flat
   ```

1. Commit the changes to `main-v1` using:

   ```sh
   git add lib/ CHANGELOG.md package.json package-lock.json README.md
   git commit --no-verify -m "chore: version bump"
   ```

1. Create a [git tag] for the new version and update the tag pointing to the
   latest v1 release using:

   ```sh
   git tag v1.6.1
   git tag -f v1
   ```

1. Push the commit and tags:

   ```sh
   git push origin main-v1 v1.6.1
   git push origin v1 --force
   ```

[git tag]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
[semantic versioning]: https://semver.org/spec/v2.0.0.html
