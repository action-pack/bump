# Bump version
[![Build](https://github.com/action-pack/bump/actions/workflows/build.yml/badge.svg)](https://github.com/action-pack/bump/)
[![Version](https://img.shields.io/github/v/tag/action-pack/bump?label=version&sort=semver&color=066da5)](https://github.com/marketplace/actions/bump-version-number)
[![Size](https://img.shields.io/github/size/action-pack/bump/dist/index.js?branch=release/v2.0&label=size&color=066da5)](https://github.com/action-pack/bump/)

Action to bump a version number using repository variables.

## Usage

```YAML
uses: action-pack/bump@v2
with:
  token: ${{ secrets.REPO_ACCESS_TOKEN }}
```

## Inputs

### token

**Required** `String` Repository [Access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)

### owner

**Optional** `String` Owners name.

### repository

**Optional** `String` Repository name.

### org

**Optional** `Boolean` Indicates the repo is an [organization](https://docs.github.com/en/github/setting-up-and-managing-organizations-and-teams/about-organizations).
