[![Build Status](https://travis-ci.org/AdrienEtienne/activin.svg?branch=master)](https://travis-ci.org/AdrienEtienne/activin)
[![Coverage Status](https://coveralls.io/repos/github/AdrienEtienne/activin/badge.svg?branch=master)](https://coveralls.io/github/AdrienEtienne/activin?branch=master)

# ActivIn

Provide a way to find partners for sport sessions.
You will can to find other active people, schedule a session, make friends.

## Link production site

[ActivIn](http://activin-aenode.rhcloud.com/)

## Features

 * Connexion as user
 * Choose your sports
 * Add your favorite places
 * Find partners neer your position

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Ruby](https://www.ruby-lang.org) and then `gem install sass`
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Developing

1. Run `npm install` to install server dependencies.
   *Windows* : Run `npm install karma-phantomjs-launcher` command

2. Run `bower install` to install front-end dependencies.

3. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

4. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `grunt build` for building and `grunt serve` for preview.

## Testing

Running `npm test` will run the unit tests with karma.

## Link

The [Github](https://github.com/AdrienEtienne/activin)
