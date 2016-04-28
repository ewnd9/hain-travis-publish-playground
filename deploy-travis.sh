#!/bin/sh

set -e

(cd app && npm install)

node_modules/.bin/gulp build-debian
mv **/*.deb hain-${TRAVIS_TAG}.deb
