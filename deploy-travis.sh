#!/bin/sh

set -e

node_modules/.bin/gulp build-debian
mv **/*.deb hain-${TRAVIS_TAG}.deb
