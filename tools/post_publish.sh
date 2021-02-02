#! /bin/bash
# Generate a dev version with no tag and push. Meant to be called immediately after publishing new version with tag/npm package.
set -e
git commit --allow-empty -m "empty commit"
./node_modules/.bin/lerna version --force-publish prepatch --preid dev --no-git-tag-version
git add bids-validator-web/package-lock.json bids-validator-web/package.json bids-validator/package-lock.json bids-validator/package.json lerna.json
git commit -m "setting dev version"
git push
