[![CircleCI](https://circleci.com/gh/bids-standard/bids-validator.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/bids-standard/bids-validator)
[![Gitlab pipeline status](https://img.shields.io/gitlab/pipeline/bids-standard/bids-validator?logo=GitLab)](https://gitlab.com/bids-standard/bids-validator/pipelines)
[![Codecov](https://codecov.io/gh/bids-standard/bids-validator/branch/master/graph/badge.svg)](https://codecov.io/gh/bids-standard/bids-validator)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3688707.svg)](https://doi.org/10.5281/zenodo.3688707)

# BIDS-Validator

- [BIDS-Validator](#bids-validator)
  - [Quickstart](#quickstart)
  - [Support](#support)
  - [Maintainers and Contributors](#maintainers-and-contributors)
  - [Use](#use)
    - [API](#api)
    - [.bidsignore](#bidsignore)
    - [Configuration](#configuration)
    - [In the Browser](#in-the-browser)
    - [On the Server](#on-the-server)
    - [Through Command Line](#through-command-line)
  - [Docker image](#docker-image)
  - [Python Library](#python-library)
    - [Example](#example)
  - [Development](#development)
    - [Running Locally in a Browser](#running-locally-in-a-browser)
    - [Testing](#testing)
    - [Publishing](#publishing)
  - [Acknowledgments](#acknowledgments)

## Quickstart

1. Web version:
   1. Open [Google Chrome](https://www.google.com/chrome/) or
      [Mozilla Firefox](https://mozilla.org/firefox) (currently the only
      supported browsers)
   1. Go to http://bids-standard.github.io/bids-validator/ and select a folder
      with your BIDS dataset. If the validator seems to be working longer than
      couple of minutes please open [developer tools ](https://developer.chrome.com/devtools)
      and report the error at [https://github.com/bids-standard/bids-validator/issues](https://github.com/bids-standard/bids-validator/issues).
1. Command line version:
   1. Install [Node.js](https://nodejs.org) (at least version 10.11.0)
   1. Update `npm` to be at least version 7 (`npm install --global npm@^7`)
   1. From a terminal run `npm install -g bids-validator`
   1. Run `bids-validator` to start validating datasets.
1. Docker
   1. Install Docker
   1. From a terminal run `docker run -ti --rm -v /path/to/data:/data:ro bids/validator /data`
      but replace the `/path/to/data` part of the command with your own path on your machine.
1. Python Library:
   1. Install [Python](https://www.python.org/)
   1. Install [Pip](https://pip.pypa.io/en/stable/installing/) package manager for Python, if
      not already installed.
   1. From a terminal run `pip install bids_validator` to acquire the
      [BIDS Validator PyPi package](https://pypi.org/project/bids-validator/)
   1. Open a Python terminal and type: `python`
   1. Import the BIDS Validator package `from bids_validator import BIDSValidator`
   1. Check if a file is BIDS compatible `BIDSValidator().is_bids('path/to/a/bids/file')`

## Support

The BIDS Validator is designed to work in both the browser and in Node.js. We
target support for the latest long term stable (LTS) release of Node.js and the
latest version of Chrome.

There is also a library of helper functions written in Python, for use with BIDS
compliant applications written in this language.

Please report any issues you experience while using these support targets via
the [GitHub issue tracker](https://github.com/bids-standard/bids-validator/issues).
If you experience issues outside of these supported environments and believe we
should extend our targeted support feel free to open a new issue describing the
issue, your support target and why you require extended support and we will
address these issues on a case by case basis.

## Maintainers and Contributors

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-42-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.
Contributions of any kind are welcome!

The project is maintained by [@rwblair](https://github.com/rwblair/) with the help of many contributors listed below.
(The [emoji key](https://allcontributors.org/docs/en/emoji-key) is indicating the kind of contribution)

Please also see [Acknowledgments](#acknowledgments).

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://adam2392.github.io/"><img src="https://avatars.githubusercontent.com/u/3460267?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Adam Li</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=adam2392" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=adam2392" title="Tests">⚠️</a> <a href="#userTesting-adam2392" title="User Testing">📓</a> <a href="https://github.com/bids-standard/bids-validator/issues?q=author%3Aadam2392" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/agt24"><img src="https://avatars.githubusercontent.com/u/7869017?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Adam Thomas</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=agt24" title="Documentation">📖</a></td>
    <td align="center"><a href="http://happy5214.freedynamicdns.org/"><img src="https://avatars.githubusercontent.com/u/2992751?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Alexander Jones</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=happy5214" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=happy5214" title="Tests">⚠️</a> <a href="#ideas-happy5214" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://chrisgorgolewski.org"><img src="https://avatars.githubusercontent.com/u/238759?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Chris Gorgolewski</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/issues?q=author%3Achrisgorgo" title="Bug reports">🐛</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=chrisgorgo" title="Code">💻</a> <a href="#data-chrisgorgo" title="Data">🔣</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=chrisgorgo" title="Documentation">📖</a> <a href="#example-chrisgorgo" title="Examples">💡</a> <a href="#ideas-chrisgorgo" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-chrisgorgo" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-chrisgorgo" title="Maintenance">🚧</a> <a href="#mentoring-chrisgorgo" title="Mentoring">🧑‍🏫</a> <a href="#question-chrisgorgo" title="Answering Questions">💬</a> <a href="https://github.com/bids-standard/bids-validator/pulls?q=is%3Apr+reviewed-by%3Achrisgorgo" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=chrisgorgo" title="Tests">⚠️</a> <a href="#tutorial-chrisgorgo" title="Tutorials">✅</a> <a href="#talk-chrisgorgo" title="Talks">📢</a> <a href="#userTesting-chrisgorgo" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/choldgraf"><img src="https://avatars.githubusercontent.com/u/1839645?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Chris Holdgraf</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=choldgraf" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/effigies"><img src="https://avatars.githubusercontent.com/u/83442?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Chris Markiewicz</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=effigies" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=effigies" title="Tests">⚠️</a> <a href="#ideas-effigies" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/bids-standard/bids-validator/issues?q=author%3Aeffigies" title="Bug reports">🐛</a> <a href="#question-effigies" title="Answering Questions">💬</a> <a href="#tool-effigies" title="Tools">🔧</a> <a href="#maintenance-effigies" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/david-nishi"><img src="https://avatars.githubusercontent.com/u/28666458?v=4?s=50" width="50px;" alt=""/><br /><sub><b>David Nishikawa</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=david-nishi" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=david-nishi" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/DimitriPapadopoulos"><img src="https://avatars.githubusercontent.com/u/3234522?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Dimitri Papadopoulos Orfanos</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=DimitriPapadopoulos" title="Code">💻</a></td>
    <td align="center"><a href="https://duncanmmacleod.github.io/"><img src="https://avatars.githubusercontent.com/u/1618530?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Duncan Macleod</b></sub></a><br /><a href="#infra-duncanmmacleod" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/franklin-feingold"><img src="https://avatars.githubusercontent.com/u/35307458?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Franklin Feingold</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=franklin-feingold" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/thinknoack"><img src="https://avatars.githubusercontent.com/u/3342083?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Gregory noack</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=thinknoack" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=thinknoack" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://chymera.eu/"><img src="https://avatars.githubusercontent.com/u/950524?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Horea Christian</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=TheChymera" title="Code">💻</a></td>
    <td align="center"><a href="https://kaczmarj.github.io/"><img src="https://avatars.githubusercontent.com/u/17690870?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Jakub Kaczmarzyk</b></sub></a><br /><a href="#infra-kaczmarj" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/jokedurnez"><img src="https://avatars.githubusercontent.com/u/7630327?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Joke Durnez</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=jokedurnez" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://jasmainak.github.io/"><img src="https://avatars.githubusercontent.com/u/15852194?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Mainak Jas</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=jasmainak" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=jasmainak" title="Tests">⚠️</a> <a href="#ideas-jasmainak" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/bids-standard/bids-validator/pulls?q=is%3Apr+reviewed-by%3Ajasmainak" title="Reviewed Pull Requests">👀</a> <a href="#userTesting-jasmainak" title="User Testing">📓</a></td>
    <td align="center"><a href="http://fair.dei.unipd.it/marco-castellaro"><img src="https://avatars.githubusercontent.com/u/5088923?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Marco Castellaro</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=marcocastellaro" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=marcocastellaro" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/MaxvandenBoom"><img src="https://avatars.githubusercontent.com/u/43676624?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Max</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=MaxvandenBoom" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/issues?q=author%3AMaxvandenBoom" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://psychoinformatics.de/"><img src="https://avatars.githubusercontent.com/u/136479?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Michael Hanke</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=mih" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/naveau"><img src="https://avatars.githubusercontent.com/u/1488318?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Mikael Naveau</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=naveau" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/nellh"><img src="https://avatars.githubusercontent.com/u/11369795?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Nell Hardcastle</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=nellh" title="Code">💻</a> <a href="#ideas-nellh" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-nellh" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#question-nellh" title="Answering Questions">💬</a> <a href="https://github.com/bids-standard/bids-validator/pulls?q=is%3Apr+reviewed-by%3Anellh" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/ntraut"><img src="https://avatars.githubusercontent.com/u/22977927?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Nicolas Traut</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=ntraut" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.linkedin.com/in/parul-sethi"><img src="https://avatars.githubusercontent.com/u/11822050?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Parul Sethi</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=parulsethi" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=parulsethi" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/patsycle"><img src="https://avatars.githubusercontent.com/u/41481345?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Patricia Clement</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=patsycle" title="Code">💻</a></td>
    <td align="center"><a href="https://remi-gau.github.io/"><img src="https://avatars.githubusercontent.com/u/6961185?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Remi Gau</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=Remi-Gau" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=Remi-Gau" title="Documentation">📖</a> <a href="#userTesting-Remi-Gau" title="User Testing">📓</a></td>
    <td align="center"><a href="https://hoechenberger.net/"><img src="https://avatars.githubusercontent.com/u/2046265?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Richard Höchenberger</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=hoechenberger" title="Code">💻</a> <a href="#userTesting-hoechenberger" title="User Testing">📓</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=hoechenberger" title="Tests">⚠️</a> <a href="https://github.com/bids-standard/bids-validator/issues?q=author%3Ahoechenberger" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/robertoostenveld"><img src="https://avatars.githubusercontent.com/u/899043?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Robert Oostenveld</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=robertoostenveld" title="Code">💻</a> <a href="#ideas-robertoostenveld" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/bids-standard/bids-validator/issues?q=author%3Arobertoostenveld" title="Bug reports">🐛</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=robertoostenveld" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/SetCodesToFire"><img src="https://avatars.githubusercontent.com/u/25459509?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Rohan Goyal</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=SetCodesToFire" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/rwblair"><img src="https://avatars2.githubusercontent.com/u/14927911?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Ross Blair</b></sub></a><br /><a href="#maintenance-rwblair" title="Maintenance">🚧</a> <a href="#ideas-rwblair" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=rwblair" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/issues?q=author%3Arwblair" title="Bug reports">🐛</a> <a href="#infra-rwblair" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#projectManagement-rwblair" title="Project Management">📆</a> <a href="#question-rwblair" title="Answering Questions">💬</a> <a href="https://github.com/bids-standard/bids-validator/pulls?q=is%3Apr+reviewed-by%3Arwblair" title="Reviewed Pull Requests">👀</a> <a href="#tool-rwblair" title="Tools">🔧</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=rwblair" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://www.poldracklab.org/"><img src="https://avatars.githubusercontent.com/u/871056?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Russ Poldrack</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=poldrack" title="Code">💻</a> <a href="#financial-poldrack" title="Financial">💵</a> <a href="#fundingFinding-poldrack" title="Funding Finding">🔍</a></td>
    <td align="center"><a href="http://soichi.us/"><img src="https://avatars.githubusercontent.com/u/923896?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Soichi Hayashi</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/issues?q=author%3Asoichih" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.stefanappelhoff.com"><img src="https://avatars.githubusercontent.com/u/9084751?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Stefan Appelhoff</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/issues?q=author%3Asappelhoff" title="Bug reports">🐛</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=sappelhoff" title="Code">💻</a> <a href="#data-sappelhoff" title="Data">🔣</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=sappelhoff" title="Documentation">📖</a> <a href="#example-sappelhoff" title="Examples">💡</a> <a href="#ideas-sappelhoff" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-sappelhoff" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-sappelhoff" title="Maintenance">🚧</a> <a href="#mentoring-sappelhoff" title="Mentoring">🧑‍🏫</a> <a href="#question-sappelhoff" title="Answering Questions">💬</a> <a href="https://github.com/bids-standard/bids-validator/pulls?q=is%3Apr+reviewed-by%3Asappelhoff" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=sappelhoff" title="Tests">⚠️</a> <a href="#tutorial-sappelhoff" title="Tutorials">✅</a> <a href="#talk-sappelhoff" title="Talks">📢</a> <a href="#userTesting-sappelhoff" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/suyashdb"><img src="https://avatars.githubusercontent.com/u/11152799?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Suyash </b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=suyashdb" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tsalo"><img src="https://avatars.githubusercontent.com/u/8228902?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Taylor Salo</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=tsalo" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/olgn"><img src="https://avatars.githubusercontent.com/u/8853289?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Teal Hobson-Lowther</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=olgn" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=olgn" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/riddlet"><img src="https://avatars.githubusercontent.com/u/4789331?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Travis Riddle</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/issues?q=author%3Ariddlet" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/VisLab"><img src="https://avatars.githubusercontent.com/u/1189050?v=4?s=50" width="50px;" alt=""/><br /><sub><b>VisLab</b></sub></a><br /><a href="#ideas-VisLab" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=VisLab" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/wazeerzulfikar"><img src="https://avatars.githubusercontent.com/u/15856554?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Wazeer Zulfikar</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=wazeerzulfikar" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/yarikoptic"><img src="https://avatars.githubusercontent.com/u/39889?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Yaroslav Halchenko</b></sub></a><br /><a href="#ideas-yarikoptic" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=yarikoptic" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=yarikoptic" title="Documentation">📖</a> <a href="#userTesting-yarikoptic" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/constellates"><img src="https://avatars.githubusercontent.com/u/4325905?v=4?s=50" width="50px;" alt=""/><br /><sub><b>constellates</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=constellates" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=constellates" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/dewarrn1"><img src="https://avatars.githubusercontent.com/u/1322751?v=4?s=50" width="50px;" alt=""/><br /><sub><b>dewarrn1</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=dewarrn1" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dkp"><img src="https://avatars.githubusercontent.com/u/965184?v=4?s=50" width="50px;" alt=""/><br /><sub><b>dkp</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=dkp" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/MatthewZito"><img src="https://avatars.githubusercontent.com/u/47864657?v=4?s=50" width="50px;" alt=""/><br /><sub><b>goldmund</b></sub></a><br /><a href="https://github.com/bids-standard/bids-validator/commits?author=MatthewZito" title="Code">💻</a> <a href="https://github.com/bids-standard/bids-validator/commits?author=MatthewZito" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Use

### API

The BIDS Validator has one primary method that takes a directory as either a
path to the directory (node) or the object given by selecting a directory with a
file input (browser), an options object, and a callback.

Available options include:

- ignoreWarnings - (boolean - defaults to false)
- ignoreNiftiHeaders - (boolean - defaults to false)

For example:

`validate.BIDS(directory, {ignoreWarnings: true}, function (issues, summary) {console.log(issues.errors, issues.warnings);});`

If you would like to test individual files you can use the file specific checks
that we expose.

- validate.BIDS()
- validate.JSON()
- validate.TSV()
- validate.NIFTI()

Additionally you can reformat stored errors against a new config using `validate.reformat()`

### .bidsignore

Optionally one can include a `.bidsignore` file in the root of the dataset. This
file lists patterns (compatible with the [.gitignore syntax](https://git-scm.com/docs/gitignore))
defining files that should be ignored by the validator. This option is useful
when the validated dataset includes file types not yet supported by BIDS
specification.

```Text
*_not_bids.txt
extra_data/
```

### Configuration

You can configure the severity of errors by passing a json configuration file
with a `-c` or `--config` flag to the command line interface or by defining a
config object on the options object passed during javascript usage.

If no path is specified a default path of `.bids-validator-config.json` will be used. You can add this file to your dataset to share dataset specific validation configuration. To disable this behavior use `--no-config` and the default configuration will be used.

The basic configuration format is outlined below. All configuration is optional.

```JSON
{
	"ignore": [],
	"warn": [],
	"error": [],
	"ignoredFiles": []
}
```

`ignoredFiles` takes a list of file paths or glob patterns you'd like to ignore.
Lets say we want to ignore all files and sub-directory under `/derivatives/`.
**This is not the same syntax as used in the .bidsignore file**

```JSON
{
	"ignoredFiles": ["/derivatives/**"]
}
```

Note that adding two stars `**` in path makes validator recognize all files and
sub-dir to be ignored.

`ignore`, `warn`, and `error` take lists of issue codes or issue keys and change
the severity of those issues so they are either ignored or reported as warnings
or errors. You can find a list of all available issues at
[utils/issues/list](https://github.com/bids-standard/bids-validator/blob/master/bids-validator/utils/issues/list.js).

Some issues may be ignored by default, but can be elevated to warnings or errors.
These provide a way to check for common things that are more specific than BIDS
compatibility. An example is a check for the presence of a T1w modality. The
following would raise an error if no T1W image was found in a dataset.

```JSON
{
	"error": ["NO_T1W"]
}
```

In addition to issue codes and keys these lists can also contain objects with
and "and" or "or" properties set to arrays of codes or keys. These allow some
level of conditional logic when configuring issues. For example:

```JSON
{
	"ignore": [
		{
			"and": [
				"ECHO_TIME_GREATER_THAN",
				"ECHO_TIME_NOT_DEFINED"
			]
		}
	]
}
```

In the above example the two issues will only be ignored if both of them are
triggered during validation.

```JSON
{
	"ignore": [
		{
			"and": [
				"ECHO_TIME_GREATER_THAN",
				"ECHO_TIME_NOT_DEFINED"
				{
					"or": [
						"ECHO_TIME1-2_NOT_DEFINED",
						"ECHO_TIME_MUST_DEFINE"
					]
				}
			]
		}
	]
}
```

And in this example the listed issues will only be ignored if
`ECHO_TIME_GREATER_THAN`, `ECHO_TIME_NOT_DEFINED` and either
`ECHO_TIME1-2_NOT_DEFINED` or `ECHO_TIME_MUST_DEFINE` are triggered during
validation.

"or" arrays are not supported at the lowest level because it wouldn't add any
functionality. For example the following is not supported.

```JSON
{
	"ignore": [
		{
			"or": [
				"ECHO_TIME_GREATER_THAN",
				"ECHO_TIME_NOT_DEFINED"
			]
		}
	]
}
```

because it would be functionally the same as this:

```JSON
{
	"ignore": [
		"ECHO_TIME_GREATER_THAN",
		"ECHO_TIME_NOT_DEFINED"
	]
}
```

For passing a configuration while using the bids-validator on the command line,
you can use the following style to for example ignore empty
file errors (99) and files that cannot be read (44):

```
bids-validator --config.ignore=99 --config.ignore=44 path/to/bids/dir
```

This style of use puts limits on what configuration you can require, so for
complex scenarios, we advise users to create a dedicated configuration file with
contents as described above.

### In the Browser

The BIDS Validator currently works in the browser with [browserify](http://browserify.org/)
or [webpack](https://webpack.js.org/). You can add it to a project by cloning
the validator and requiring it with browserify syntax
`var validate = require('bids-validator');` or an ES2015 webpack import
`import validate from 'bids-validator'`.

### On the Server

The BIDS validator works like most npm packages. You can install it by running
`npm install bids-validator`.

### Through Command Line

If you install the bids validator globally by using `npm install -g bids-validator`
you will be able to use it as a command line tool. Once installed you should be
able to run `bids-validator /path/to/your/bids/directory` and see any validation
issues logged to the terminal. Run `bids-validator` without a directory path to
see available options.

## Docker image

[![Docker Image Version (latest by date)](https://img.shields.io/docker/v/bids/validator?label=docker)](https://hub.docker.com/r/bids/validator)

To use bids validator with [docker](https://www.docker.com/), you simply need to
[install docker](https://docs.docker.com/install/) on your system.

And then from a terminal run:

- `docker run -ti --rm bids/validator --version` to print the version of the
  docker image
- `docker run -ti --rm bids/validator --help` to print the help
- `docker run -ti --rm -v /path/to/data:/data:ro bids/validator /data`
  to validate the dataset `/path/to/data` on your host machine

See here for a brief explanation of the commands:

- `docker run` is the command to tell docker to run a certain docker image,
  usually taking the form `docker run <IMAGENAME> <COMMAND>`
- the `-ti` flag means the inputs are accepted and outputs are printed to the
  terminal
- the `--rm` flag means that the state of the docker container is not saved
  after it has run
- the `-v` flag is adding your local data to the docker container
  ([bind-mounts](https://docs.docker.com/storage/bind-mounts/)). Importantly,
  the input after the `-v` flag consists of three fields separated colons: `:`
  - the first field is the path to the directory on the host machine:
    `/path/to/data`
  - the second field is the path where the directory is mounted in the
    container
  - the third field is optional. In our case, we use `ro` to specify that the
    mounted data is _read only_

## Python Library

[![PyPI version](https://badge.fury.io/py/bids-validator.svg)](https://badge.fury.io/py/bids-validator)

There are is a limited library of helper functions written in Python. The main function
determines if a file extension is compliant with the BIDS specification. You can find
the available functions in the library, as well as their descriptions,
[here](https://github.com/bids-standard/bids-validator/blob/master/bids-validator/bids_validator/bids_validator.py).
To install, run `pip install -U bids_validator` (requires python and pip).

### Example

```Python
from bids_validator import BIDSValidator
validator = BIDSValidator()
filepaths = ["/sub-01/anat/sub-01_rec-CSD_T1w.nii.gz", "/sub-01/anat/sub-01_acq-23_rec-CSD_T1w.exe"]
for filepath in filepaths:
    print(validator.is_bids(filepath))  # will print True, and then False
```

## Development

To develop locally, clone the project and run `npm install` from the project
root. This will install external dependencies. If you wish to install
`bids-validator` globally (so that you can run it in other folders), use the
following command to install it globally: `cd bids-validator && npm install -g`

Please see the [CONTRIBUTING.md](../CONTRIBUTING.md)
for additional details.

### Running Locally in a Browser

A note about OS X, the dependencies for the browser require a npm package called
node-gyp which needs xcode to be installed in order to be compiled.

1. The browser version of `bids-validator` lives in the repo subdirectory
   `/bids-validator-web`. It is a [React.js](https://reactjs.org/) application
   that uses the [next.js](https://nextjs.org/) framework.
2. To develop `bids-validator` and see how it will act in the browser, simply run
   `npm run web-dev` in the project root and navigate to `localhost:3000`.
3. In development mode, changes to the codebase will trigger rebuilds of the application
   automatically.
4. Changes to the `/bids-validator` in the codebase will also be reflected in the
   web application.
5. Tests use the [Jest](https://jestjs.io/index.html) testing library and should be developed in `/bids-validator-web/tests`.
   We can always use more tests, so please feel free to contribute a test that reduces the chance
   of any bugs you fix!
6. To ensure that the web application compiles successfully in production, run `npm run web-export`

### Testing

If it's your first time running tests, first use the command `git submodule update --init --depth 1` to pull the test example data. This repo contains the [bids-examples github repository](https://github.com/bids-standard/bids-examples) as a [submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules).

To start the test suite run `npm run test` from the project root. `npm run test -- --watch`
is useful to run tests while making changes. A coverage report is available with
`npm run coverage`.

To run the linter which checks code conventions run `npm run lint`.

### Publishing

Publishing is done with [Lerna](https://github.com/lerna/lerna). Use the command `npm run lernaPublish` and follow instructions to set a new version.

Using lerna publish will create a git commit with updated version information and create a version number tag for it, push the tag to GitHub, then publish to NPM and PyPI. The GitHub release is manual following that.

## Acknowledgments

Many contributions to the `bids-validator` were done by members of the
BIDS community. See the
[list of contributors](https://bids-specification.readthedocs.io/en/stable/99-appendices/01-contributors.html).

A large part of the development of `bids-validator` is currently done by
[Squishymedia](https://squishymedia.com/), who are in turn financed through
different grants offered for the general development of BIDS. See the list
below.

Development and contributions were supported through the following federally
funded projects/grants:

- [BIDS Derivatives (NIMH: R24MH114705, PI: Poldrack)](http://grantome.com/grant/NIH/R24-MH114705-01)
- [OpenNeuro (NIMH: R24MH117179, PI: Poldrack)](http://grantome.com/grant/NIH/R24-MH117179-01)
- [Spokes: MEDIUM: WEST (NSF: 1760950, PI: Poldrack & Gorgolewski)](http://grantome.com/grant/NSF/IIS-1760950)
- [ReproNim](http://repronim.org) [(NIH-NIBIB P41 EB019936, PI: Kennedy)](https://projectreporter.nih.gov/project_info_description.cfm?aid=8999833)
