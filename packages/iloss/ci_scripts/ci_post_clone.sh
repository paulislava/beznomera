#!/bin/sh
# Runs after Xcode Cloud clones the repository.
# Generates the Xcode project from project.yml using xcodegen.
set -e

echo "--- Installing xcodegen ---"
brew install xcodegen

echo "--- Generating Xcode project ---"
cd "${CI_PRIMARY_REPOSITORY_PATH}/packages/ios"
xcodegen generate

echo "--- Done ---"
