Balena SDK
=========

> The official JavaScript [balena](https://balena.io/) SDK.

[![npm version](https://badge.fury.io/js/balena-sdk.svg)](http://badge.fury.io/js/balena-sdk)
[![dependencies](https://david-dm.org/balena-io/balena-sdk.svg)](https://david-dm.org/balena-io/balena.sdk.svg)
[![Build Status](https://travis-ci.org/balena-io/balena-sdk.svg?branch=master)](https://travis-ci.org/balena-io/balena-sdk)
[![Build status](https://ci.appveyor.com/api/projects/status/gsloi9vj4jclg7j1/branch/master?svg=true)](https://ci.appveyor.com/project/resin-io/balena-sdk)

## Role

The intention of this module is to provide developers a nice API to integrate their JavaScript applications with balena.

## Installation

Install the balena SDK by running:

```sh
$ npm install --save balena-sdk
```

## Platforms

We currently support NodeJS (12+) and the browser.

The following features are node-only:
- OS image streaming download (`balena.models.os.download`),
- balena settings client (`balena.settings`).

In Node you can simply `require('balena-sdk')`, but in the browser things are more complicated. The balena SDK provides a bundled single file for browsers, which allows you to include a single file with all dependencies included, available as [balena-browser.min.js](https://unpkg.com/balena-sdk/es2015/balena-browser.min.js) (or [balena-browser.js](https://unpkg.com/balena-sdk/es2015/balena-browser.js) if you'd like the much larger unminified version). This uses the [UMD format](https://github.com/umdjs/umd), and will register itself as either a CommonJS or AMD module called `balena-sdk` if possible, or create a `balenaSdk` global if not. You can also use the `es2018` version if desired.

### Bundling for browsers

If you're using webpack, browserify, or a similar tool then you probably want to bundle the balena SDK into your application yourself, rather than using the pre-built `balena-browser.js` bundle. If you do that, you should be aware that you may pick up some dependencies that are actually unnecessary in the browser, because they're only used in Node environments. You can safely exclude these dependencies, if you're not using them yourself, and significantly reduce the size of your resulting bundle.

In the browser the balena SDK doesn't use the following dependencies:

* fs
* path
* balena-settings-client
* node-localstorage

For the future we're looking at ways to automatically exclude these in downstream bundles. See [#254](https://github.com/balena-io/balena-sdk/issues/254) for more information.

### Bundling with pkg

The balena SDK includes builds for various ECMAScript versions that are
dynamically selected at runtime (using 
[@balena/es-version](https://github.com/balena-io-modules/balena-es-version)).
For this reason, packagers like [pkg](https://github.com/vercel/pkg) are not
able to automatically detect which assets to include in the output package. The
following sample `pkg` section should be added to your application's
`package.json` file to instruct `pkg` to bundle the required assets:

```json
  "pkg": {
    "scripts": [
      "node_modules/balena-sdk/**/*.js"
    ],
    "assets": [
      "node_modules/balena-pine/**/*",
      "node_modules/pinejs-client-core/**/*"
    ]
  }
```

For more information, please refer to the respective
[documentation from the `pkg` project](https://github.com/vercel/pkg#config).

## Documentation

The module exports a single factory function. Use it like this:

```
var balena = require('balena-sdk')({
	apiUrl: "https://api.balena-cloud.com/",
	dataDirectory: "/opt/local/balena"
})
```

Where the factory method accepts the following options:
* `apiUrl`, string, *optional*, is the balena API url. Defaults to `https://api.balena-cloud.com/`,
* `builderUrl`, string, *optional* , is the balena builder url. Defaults to `https://builder.balena-cloud.com/`,
* `deviceUrlsBase`, string, *optional*, is the base balena device API url. Defaults to `balena-devices.com`,
* `dataDirectory`, string, *optional*, *ignored in the browser*, is the directory where the user settings are stored, normally retrieved like `require('balena-settings-client').get('dataDirectory')`. Defaults to `$HOME/.balena`,
* `isBrowser`, boolean, *optional*, is the flag to tell if the module works in the browser. If not set will be computed based on the presence of the global `window` value,
* `debug`, boolean, *optional*, when set will print some extra debug information.

See the JSDoc markdown documentation for the returned `balena` object in [DOCUMENTATION.md](https://github.com/balena-io/balena-sdk/blob/master/DOCUMENTATION.md).

## Support

If you face any issues, please [raise an issue](https://github.com/balena-io/balena-sdk/issues/new) on GitHub and the balena team will be happy to help.

## Deprecation policy

The balena SDK uses [semver versioning](https://semver.org/), with the concepts
of major, minor and patch version releases.

The latest release of the previous major version of the balena SDK will remain
compatible with the balenaCloud backend services for one year from the date when
the next major version is released.
For example, balena SDK v12.33.4, as the latest v12 release, would remain
compatible with the balenaCloud backend for one year from the date when v13.0.0
is released.

At the end of this period, the older major version is considered deprecated and
some of the functionality that depends on balenaCloud services may stop working
at any time.
Users are encouraged to regularly update the balena SDK to the latest version.

## Tests

In order to run the balena SDK test suite, set the following environment variables from an account that exists and doesn't have a billing account code:
**WARNING: This will delete all applications and public keys of the test users. As such, all emails are required to
contain the string `+testsdk` to avoid accidental deletion**

- `TEST_EMAIL`: The main account email.
- `TEST_PASSWORD`: The main account password.
- `TEST_USERNAME`: The main account username.

- `TEST_MEMBER_EMAIL`: The email of the account for the membership tests.
- `TEST_MEMBER_PASSWORD`: The password of the account for the membership tests.
- `TEST_MEMBER_USERNAME`: The username of the account for the membership tests.

You also have to provide the following environment variables from an account that doesn't yet exist:

- `TEST_REGISTER_EMAIL`: The email of the account to register.
- `TEST_REGISTER_PASSWORD`: The password of the account to register.
- `TEST_REGISTER_USERNAME`: The username of the account to register.

In order to test the billing methods for a paid account, you also have to configure the following environment variables:

- `TEST_PAID_EMAIL`: The email of the paid account.
- `TEST_PAID_PASSWORD`: The password of the account.

*Note: The paid user's `account billing code` should be set to `testdev` so that it's tested against the test plan.*

You can also, optionally, set the `TEST_API_URL` environment variable in order to run the tests using a different API backend (eg: `https://api.balena-staging.com`).

You can persist these settings by putting them all into a `.env` file in the root of this repo, in
[dotenv](https://www.npmjs.com/package/dotenv) format (`KEY=VALUE\n`). This will be automatically detected and used in the tests.
Make sure you don't accidentally commit this file (`.env` by default is gitignored, so hopefully this should be difficult).

Run the test suite by doing:

```sh
$ npm test
```

In order to make the develop & test cycle faster:
* You can use [mocha's `.only` & `.skip`](https://mochajs.org/#exclusive-tests) variants
  to only run the subset of the test cases that is relevant to your changes/additions. You should make sure to remove those from
  your code before you push and make sure that the complete test suite completes successfully.
* You can use `npm run test:fast` which fixes linting issues, only builds for a single ES target and runs the tests only on node.
  This can save time when implementing a method that interacts with an API endpoint, but should be avoided if the feature might
  work different or only in the browser.

## Contribute

- Issue Tracker: [github.com/balena-io/balena-sdk/issues](https://github.com/balena-io/balena-sdk/issues)
- Source Code: [github.com/balena-io/balena-sdk](https://github.com/balena-io/balena-sdk)

Before submitting a PR, please make sure that you
* don't have uncommited changes on the documentation or the build output
* don't have any `.only` or `.skip` in your tests
* include typings for new methods
* include tests and that they pass

```sh
$ npm test
```

## License

The project is licensed under the Apache 2.0 license.
