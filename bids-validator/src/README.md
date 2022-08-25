# Intro

This is a partial rewrite of the bids-validator JavaScript implementation designed to read the [bids-specification schema](https://github.com/bids-standard/bids-specification/tree/master/src/schema) to apply the majority of validation rules.

Deno is a JavaScript and TypeScript runtime that is used to run the schema based validator. Deno is simpler than Node.js and only requires one tool to use, the Deno executable itself. To install Deno, follow these [install instructions for your platform](https://deno.land/manual/getting_started/installation).

Setup your local repository with the correct branch and submodules. At the root of the repository there are two directories, `bids-validator` and `bids-validator-web`. These are separate npm packages, the Deno validator lives within the bids-validator package within the `src` directory.

```shell
# Until [PR 1455](https://github.com/bids-standard/bids-validator/pull/1455) is merged, checkout this branch
git checkout schema-prototyping
# Make sure you have the latest specification submodule install (/bids-validator/spec from the repository root)
git submodule update
```

Install NPM dependencies and create a Deno compatible build of the legacy JavaScript validator. This allows you to run schema based validation and the existing validator implementation together.

```shell
# Install legacy validator's dependencies and build tools for this step
npm install
# Build is run from within the bids-validator package
cd bids-validator
# Creates a build of the legacy validator in /bids-validator/dist
npm run build
```

# Schema validator examples

Deno by default sandboxes applications like a web browser. To validate datasets located on your local system, you need to use the --allow-read flag to read local files. --allow-env is also required to allow for detection of OS specific features.

```shell
# Run from within the /bids-validator directory
cd bids-validator
# Run validator:
deno run --allow-env --allow-read src/main.ts path/to/dataset
```

By default both the new schema derived validation rules and the legacy JavaScript rules are run to ensure full coverage. The validator can be limited to run only the schema derived rules with the flag `--schemaOnly`.

```shell
deno run --allow-env --allow-read src/main.ts --schemaOnly path/to/dataset
```

# Schema validator test suite

```shell
# Run tests:
deno test --allow-env --allow-read src/
```
