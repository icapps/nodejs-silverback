# Silverback

NodeJS boilerplate project

[![Dependencies](https://david-dm.org/icapps/nodejs-silverback.svg)](https://david-dm.org/icapps/nodejs-silverback.svg)
[![Build Status](https://travis-ci.org/icapps/nodejs-silverback.svg?branch=master)](https://travis-ci.org/icapps/nodejs-silverback)
[![Coverage Status](https://coveralls.io/repos/github/icapps/nodejs-silverback/badge.svg)](https://coveralls.io/github/icapps/nodejs-silverback)

![alt text](http://blog.aafnation.com/wp-content/uploads/2016/12/gorilla.png "Silverback Monkey")

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

You can clone this repository using the [Ollie CLI tool](https://github.com/icapps/ollie).

### Prerequisites

Make sure you have [Node.js](http://nodejs.org/) and [Docker](https://docs.docker.com/install/) (preferably) installed.
This will make it easy to run the project locally and all tests without having to install PostgreSQL and Redis onto your system.

### Installation

Install all dependencies via npm

```shell
npm install
```

or via yarn

```shell
yarn
```

## Databases

This repository contains a `docker-compose.yml` file providing PostgreSQL and Redis.

### PostgreSQL

Start PostgreSQL in daemon mode:

```shell
docker-compose up -d postgres
```

### Migrations

The project uses a sql query builder called [knex.js](http://knexjs.org/) which provides migration support.
Run all migrations via `yarn db:migrate`.

- This will take you `DATABASE_URL` from the environment variables.

### Seeds

The project uses a sql query builder called [knex.js](http://knexjs.org/) which provides seeding support.
Run all initial seeds via `yarn db:seed`.

- This will take you `DATABASE_URL` from the environment variables.
- It will use `INITIAL_SEED_USERNAME` and `INITIAL_SEED_PASSWORD` from the environment variables to create an initial Admin user.

### Redis

Start redis in daemon mode:

```shell
docker-compose up -d redis
```

## Running locally

- Make sure you have all environment variables set in an `.env` file. There is an `.env.example` file provided with all required and optional variables.
- Make sure you have a running PostgreSQL and Redis instance

```shell
// Start
yarn start

// Build and start
yarn serve
```

## Running the tests

- Make sure you have a running PostgreSQL and Redis instance. Connection strings can be altered in the `test.config.ts` file under the `tests` folder. This will take the provided docker container strings by default.

### Run all tests

```shell
yarn test
```

### Run all tests with coverage report

```shell
yarn test:coverage
```

## Deployment

- Make sure to build the Typescript project before deploying onto [Heroku](https://travis-ci.org/) or another provider.
- [TravisCI](https://travis-ci.org/) is included in this project, but is not required to run deployments or test suites.

## Bugs

When you find issues, please report them:

- web: [https://github.com/icapps/nodejs-silverback/issues](https://github.com/icapps/nodejs-silverback/issues)

Be sure to include all of the output from the npm command that didn't work as expected. The npm-debug.log file is also helpful to provide.

## Authors

See the list of [contributors](https://github.com/icapps/nodejs-silverback/contributors) who participated in this project.

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details
