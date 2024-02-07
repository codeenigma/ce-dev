# Contribute to ce-dev

## Using test images
See [the GitHub Actions README](https://github.com/codeenigma/ce-dev/blob/2.x/.github/workflows/README.md) for information on using `devel` tagged images pushed by the CI.

## Release instructions

1. [Create a pull request](https://github.com/codeenigma/ce-dev/compare) to the `2.x` branch.

2. Once it is accepted, `git pull` your local `2.x` branch so it is up to date.

3. Working on `2.x` directly, edit [`package.json`](https://github.com/codeenigma/ce-dev/blob/1.x/package.json) in the repository root.

4. Bump the version on line 4 to the number you want. If you are at version 2.0.0 you would bump it to 2.0.1 for a minor release or 2.1.0 for a major release. If you are introducing breaking change that will not be backward compatible you should use 3.0.0.

5. Then edit the [`RELEASE`](https://github.com/codeenigma/ce-dev/blob/1.x/RELEASE) text file and describe the contents of this release (it will appear on the tag page in GitHub).

6. Commit your changes.

7. Tag it with git, e.g. `git tag 2.0.1`

8. Push the branch back up with tags, e.g. `git push origin 2.x --tags`

[GitHub Actions](https://github.com/codeenigma/ce-dev/actions) should now take care of the release for you.

## Rolling back a release

If you need to pull a release, follow these instructions:

1. Locally in your terminal on the `2.x` branch update the tags, e.g. `git pull --tags`

2. Delete the tag locally, e.g. `git tag -d 2.0.1`

3. Push the deletion up too, e.g. `git push --delete origin 2.0.1`

The deletion of the tag should also delete all trace of the release.
