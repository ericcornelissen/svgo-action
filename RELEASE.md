# Release Guidelines

If you need to release a new version of the SVGO Action you should follow the
guidelines found in this file.

## Outline

A typical release process for the current major version will look something like
this (using `v3.1.4` as an example):

1. Switch to the `main` branch and ensure you are up-to-date with origin.
2. [Update the version] in the package manifest and lockfile, and [update the
  changelog] accordingly.
3. Commit the changes using `git commit -a -m "chore: version bump"`.
4. Create a tag for the new version using `git tag v3.1.4` (including the "v").
5. Push the new commit and tag using `git push origin main v3.1.4`.
6. Update the tag pointing to the latest v3 release using `git tag -f v3`.
7. Push the tag using `git push origin v3 --force`.
8. Navigate to the repository on GitHub and create a new [GitHub Release]. If
  the version should be published to the [GitHub Marketplace] ensure that
  checkbox is checked.

### Non-current Releases

See the Release Guidelines (`RELEASE.md`) of the respective main branch.

## Updating the Version Number

To update the version number in `package.json`, change the value of the version
field to the new version (using `v3.1.4` as an example):

```diff
-  "version": "3.1.3",
+  "version": "3.1.4",
```

To update the version number in `package-lock.json` it is recommended to run
`npm install` (after updating `package.json`) this will sync the version number.

## Updating the Changelog

To update the changelog add the following text after the `## [Unreleased]` line
(using `v3.1.4` as an example):

```md
- _No changes yet_

## [3.1.4] - YYYY-MM-DD
```

The date should follow the year-month-day format where single-digit months and
days should be prefixed with a `0` (e.g. `2022-01-01`).

[github marketplace]: https://github.com/marketplace
[github release]: https://github.com/ericcornelissen/svgo-action/releases
[update the changelog]: #updating-the-changelog
[update the version]: #updating-the-version-number
