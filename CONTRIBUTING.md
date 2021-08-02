# Contributing Guide

Welcome to the contributing guide!

This guide exists to help BIDS users to contribute to the BIDS validator with
their own code. We cover:

1. Knowledge that might be helpful to have (or acquire)
1. How to set up your development environment for BIDS validator
1. Ways to contribute code to BIDS validator (e.g., for a BIDS extension
   proposal)

If you find that something is unclear, please open an [issue](https://github.com/bids-standard/bids-validator/issues)
so that we can improve this guide.

## Knowledge that will help you along the way

### Git

We use [`git`][link_git] for source control.
If you're not yet familiar with `git`, there are lots of great resources to help you
get started!
Some of our favorites include the [git Handbook][link_handbook] and
the [Software Carpentry introduction to git][link_swc_intro].

In particular, you will want to become conversant with the following operations:

- [`git clone`](https://git-scm.com/docs/git-clone)
- [`git branch`](https://git-scm.com/docs/git-branch)
- [`git checkout`](https://git-scm.com/docs/git-checkout)
- [`git status`](https://git-scm.com/docs/git-status)
- [`git pull`](https://git-scm.com/docs/git-pull)
- [`git add`](https://git-scm.com/docs/git-add)
- [`git commit`](https://git-scm.com/docs/git-commit)
- [`git push`](https://git-scm.com/docs/git-push)

You should also configure [configure git for your
user](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration), so your commits
are properly attributed.

### GitHub

We use [GitHub](https://github.com) to manage contributions and have development
discussions in the open.
To participate, be sure you know how to

- [Fork the repository][link_fork]
- [Open pull requests][link_pullrequest]

### Coding knowledge

- Familiarize yourself with the command line on your system (e.g., `bash`)
- Basic knowledge about coding is helpful and familiarity with JavaScript
  is a big bonus, but you can contribute to the BIDS validator also without
  specific knowledge of JavaScript
- Some knowledge about software testing (why we are doing it) would be nice

## Using the development version of BIDS validator

1. [Make a GitHub account][link_signupinstructions]
1. Install the required software:
   - [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
   - [NodeJS](https://nodejs.org/en/download/), including `npm` of version 7 or higher (check existing version with `npm -v`, to update an existing nodejs, we can suggest [this guide](https://phoenixnap.com/kb/update-node-js-version).)
1. In the GitHub interface, [make a fork][link_fork] of
   https://github.com/bids-standard/bids-validator to your own user (called `USER` for the
   sake of the example)
   - you will now have your own copy of BIDS validator at https://github.com/USER/bids-validator
1. Open a command line and navigate to the location on your computer from where
   you want to develop BIDS validator and [clone][link_clone] **your**
   fork of the repository
   - You will now have a new directory called `bids-validator`
   - navigate to that directory and run `git status` to verify that it's a `git`
     directory
   - run `npm install` to install the BIDS validator
1. Upon inspection of the `bids-validator` repository we can find the
   "executable" BIDS validator, located in `<...>/bids-validator/bin`, where
   `<...>` is the path to your `bids-validator` repository
   - To make this executable available from the command line, we have to add it
     to the path. On Unix systems with bash as their default shell, this means
     editing the `.bashrc` file by adding the following line to the bottom of
     it: `export PATH="$PATH:<...>/bids-validator/bin"` ... Note that `<...>`
     again needs to be replaced by the path to your BIDS validator repository
   - Now whenever you open a new command line, we will have the `bids-validator`
     executable available. You can verify by opening a new command line and
     typing `bids-validator --version`, and it should print the version number

Now your development version of BIDS validator is set up and you can use it.
Whenever you _checkout_ a new branch in your git repository, the
`bids-validator` executable is now pointing to that branch, and all changes in
that branch will be reflected in the behavior of `bids-validator`.

Before you start making changes, there are some more important points to
consider:

1. We need to tell **your** git directory, that it has a _remote_
   counterpart (namely, the original BIDS validator). When that counterpart
   gets updated, you have to update your BIDS validator as well, to keep in
   sync.
   - run `git remote add upstream https://github.com/bids-standard/bids-validator`
   - then run `git remote -v`, and it should show four entries: two of type
     `origin`, and two of type `upstream`
   - `origin` refers to **your** fork of BIDS validator on GitHub, whereas
     `upstream` refers to the original BIDS validator repository on GitHub
   - you can use `upstream` to always stay up to date with changes that are
     being made on the original BIDS validator. For that, simply navigate to
     the `master` branch of **your** repository using `git checkout master`,
     and then run `git pull upstream master`
1. When you get completely stuck with your repository and you just want to
   reset it to be an exact mirror of the original BIDS validator, you can
   run the following command (Note: this will discard all current changes):
   - first checkout your master: `git checkout master`
   - then run: `git reset --hard upstream/master`

## Extending the BIDS validator for a BIDS Extension Proposal (BEP)

### Regular expressions

A lot of validation of BIDS files and directories is happening through
[regular expressions](https://en.wikipedia.org/wiki/Regular_expression).
You can see the regular expressions
[here](https://github.com/bids-standard/bids-validator/tree/master/bids-validator/bids_validator/rules).

Changing the regular expressions can be a delicate thing, so we recommend
testing your regular expressions exhaustively. A helpful website for that can
be [https://regex101.com/](https://regex101.com/), where you can test regular
expressions in your browser, and even save and share them.

### JSON schemas

Another big chunk of BIDS validation is happening through [JSON schemas](https://json-schema.org/).
In BIDS, a lot of metadata is saved in JSON files, which are very well defined
and readable by a computer. With these properties, we can make requirements of
how a JSON ought to look like. You can find our JSON schemas
[here](https://github.com/bids-standard/bids-validator/tree/master/bids-validator/validators/json/schemas).

As with regular expressions, we recommend lots of testing on the JSON schemas.
You can easily have a first try of that using a website like
[https://www.jsonschemavalidator.net/](https://www.jsonschemavalidator.net/).
Simply copy over a schema from BIDS validator to the left field, and try to
comply to the schema, or trigger an error by typing in a JSON to the right
field.

### Writing tests

For every change you make it is important to include a test. That way, we can
make sure that the behavior of BIDS validator is as expected, and furthermore
we will be notified whenever a contributor makes a change in the code that
breaks the expected behavior of the BIDS validator.

A test usually provides some known data, and let's the software run over it ...
just to check whether the output is as we know it should be (because we know
the data, after all).

You can get a good impression using the following links:

- [How regular expressions are tested](https://github.com/bids-standard/bids-validator/blob/master/bids-validator/tests/type.spec.js)
- [How JSON schemas are tested](https://github.com/bids-standard/bids-validator/blob/master/bids-validator/tests/json.spec.js)
- [How TSV files are tested](https://github.com/bids-standard/bids-validator/blob/master/bids-validator/tests/tsv.spec.js)

For more information on how to run the tests check the [testing section](./README.md#testing) of the README.

[link_git]: https://git-scm.com/
[link_handbook]: https://guides.github.com/introduction/git-handbook/
[link_swc_intro]: http://swcarpentry.github.io/git-novice/
[link_signupinstructions]: https://help.github.com/articles/signing-up-for-a-new-github-account
[link_pullrequest]: https://help.github.com/articles/creating-a-pull-request-from-a-fork
[link_fork]: https://help.github.com/articles/fork-a-repo/
[link_clone]: https://help.github.com/articles/cloning-a-repository
