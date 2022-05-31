# Release Guidelines

If you need to release a new v2 version of the SVGO Action you should follow the
guidelines found in this file.

## Outline

A typical release process for the major version 2 will look something like this
(using `v2.3.3` as an example):

1. Make sure that your local copy of the repository is up-to-date:

   ```sh
   # Sync
   git switch main-v2
   git pull origin main-v2

   # Or clone
   git clone git@github.com:ericcornelissen/svgo-action.git
   git switch main-v2
   ```

1. Verify that the repository is in a state that can be released:

   ```sh
   npm ci # Use "ci" ("clean install"), not "install"
   npm run lint
   npm run coverage:all
   npm run build
   ```

1. Follow [Semantic Versioning] rules to determine the next version number.
   Update the version number in the package manifest and lockfile:

   ```sh
   npm version --no-git-tag-version v2.3.4
   ```

   If that fails change the value of the version field in `package.json` to the
   new version:

   ```diff
   -  "version": "2.3.3",
   +  "version": "2.3.4",
   ```

   and to update the version number in `package-lock.json` it is recommended to
   run `npm install` (after updating `package.json`) which will sync the version
   number.

1. Update the changelog by adding the following text after the `## [Unreleased]`
   line:

   ```md
   - _No changes yet_

   ## [2.3.4] - YYYY-MM-DD
   ```

   The date should follow the year-month-day format where single-digit months
   and days should be prefixed with a `0` (e.g. `2022-01-01`).

1. Commit the changes to `main-v2` using:

   ```sh
   git add lib/ CHANGELOG.md package.json package-lock.json
   git commit -m "chore: version bump"
   ```

1. Create a [git tag] for the new version and update the tag pointing to the
   latest v2 release using:

   ```sh
   git tag v2.3.4
   git tag -f v2
   ```

1. Push the commit and tags:

   ```sh
   git push origin main-v2 v2.3.4
   git push origin v2 --force
   ```

[git tag]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
[semantic versioning]: https://semver.org/spec/v2.0.0.html
