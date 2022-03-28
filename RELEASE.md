# Release Guidelines

If you need to release a new version of the SVGO Action v1 you should follow the
guidelines found in this file.

## Outline

A typical release process for v1 versions will look something like this (using
`v1.6.1` as an example):

1. Switch to the `main-v1` branch and ensure you are up-to-date with origin.
2. [Update the version] in the package manifest and lockfile, and [update the
  changelog] accordingly.
3. Commit the changes using `git commit -a -m "chore: version bump"`.
4. Create a tag for the new version using `git tag v1.6.1` (including the "v").
5. Push the new commit and tag using `git push origin main-v1 v1.6.1`.
6. Update the tag pointing to the latest v1 release using `git tag -f v1`.
7. Push the tag using `git push origin v1 --force`.
8. Navigate to the repository on GitHub and create a new [GitHub Release]. Make
  sure the release isn't published to the [GitHub Marketplace] by unchecking the
  checkbox.

## Updating the Version Number

To update the version number in `package.json`, change the value of the version
field to the new version (using `v1.6.1` as an example):

```diff
-  "version": "1.6.0",
+  "version": "1.6.1",
```

To update the version number in `package-lock.json` it is recommended to run
`npm install` (after updating `package.json`) this will sync the version number.

## Updating the Changelog

To update the changelog add the following text after the `## [Unreleased]` line
(using `v1.6.1` as an example):

```md
- _No changes yet_

## [1.6.1] - YYYY-MM-DD
```

The date should follow the year-month-day format where single-digit months and
days should be prefixed with a `0` (e.g. `2022-01-01`).

[github marketplace]: https://github.com/marketplace
[github release]: https://github.com/ericcornelissen/svgo-action/releases
[update the changelog]: #updating-the-changelog
[update the version]: #updating-the-version-number
