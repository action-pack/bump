<h1 align="center">Bump version<br />
<div align="center">
  
  [![Build](https://github.com/action-pack/bump/actions/workflows/build.yml/badge.svg)](https://github.com/action-pack/bump/)
  [![Version](https://img.shields.io/github/v/tag/action-pack/bump?label=version&sort=semver&color=066da5)](https://github.com/marketplace/actions/bump-version-number)
  [![Size](https://img.shields.io/github/size/action-pack/bump/dist/index.js?branch=release/v2.08&label=size&color=066da5)](https://github.com/action-pack/bump/)
  
</div></h1>

Action to generate a version number using repository variables.

It creates two variables, `vars.MAJOR` and `vars.MINOR` and automaticly increments the minor version each time the action is called, and the major version as soon as minor hits 100.

## Usage

```YAML
- uses: action-pack/bump@v2
  with:
    token: ${{ secrets.REPO_ACCESS_TOKEN }}
- run: echo ${{ vars.MAJOR }}.${{ vars.MINOR }}
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

## FAQ

  * ### Why do I get the error '*Resource not accessible by integration*'?

    This will happen if you use ```secrets.GITHUB_TOKEN```.

    You need to create a [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) instead.

    Go to your Github settings, select 'Developer settings' --> 'Personal access tokens' --> 'Tokens (classic)' and create a new token. Store its value in a secret, for example ```MY_TOKEN```.

    Then refer to it like this:
    
    ```yaml
    token: ${{ secrets.MY_TOKEN }}
    ```

## Stars
[![Stars](https://starchart.cc/action-pack/bump.svg?variant=adaptive)](https://starchart.cc/action-pack/bump)
