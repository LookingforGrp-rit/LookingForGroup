# LFG Starting Guide

This is the LFG getting started guide. It aims to show you the ropes of the project as a whole, and make the onboarding process smoother. We recommend you read through thoroughly so you don't miss any important details.

- [Intro](#intro)
- [Setup](#setting-up-the-project)
- [Development](#development)
- [Linting](#linting)
- [Formatting](#formatting)

## Intro

The LFG project is structured with [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces). This means there is multiple smaller projects under the LFG umbrella, and these projects generally rely on each other. These projects are the [server](#server), the [client](#client), and some [shared types](#shared).

The project using npm workspaces also means that there is a [root](.) [package.json](./package.json) file. This file manages most of the scripts that are available for you to use, and the dev dependencies that these scripts need.

There is also a [package-lock.json](./package-lock.json) file, which manages specific versions of the packages we use. This file **should not** be directly changed.

Now, here is a brief explanation of each project.

### Server

The [server](./server/) project contains the Express API that provides an interface to our database. We use [MySql](https://www.mysql.com/) as our database, and store image files with [Minio](https://min.io/), an [S3](https://aws.amazon.com/s3/) compatible object store.

It has its own [package.json](./server/package.json) file, which manages the packages and scripts that are specifically used by the server. To interact with only the server project and the server package.json, you can add the `--workspace=server` flag to npm commands.

### Client

The [client](./client/) project contains the [React](https://react.dev/) Single Page Application website. It visualizes the server's API routes for users.

It also has its own [package.json](./client/package.json) file, which manages its specific packages and scripts. To interact with only the client project and the client package.json, you can add the `--workspace=client` flag to npm commands.

### Shared

The [shared](./shared/) project refers to typescript type declarations that are shared between the client and server. It has a [package.json](./shared/package.json), but it doesn't have any packages or scripts.

### Root

As one final note, if you need to interact with the [root](.) [package.json](./package.json), you can omit the `--workspace` flag. This will run scripts in from the root package.json, and install packages into that package.json.

The only packages that should be installed into the root package.json file are packages that are needed for the scripts, or a project wide package like husky.

## Setting Up The Project

These steps should help you get ready to start working on the project.

### Install Node Dependencies

To install all dependencies, along with generating some important files, navigate to the [root](.) directory run the following command:

```bash
npm install
```

This installs all the dependencies for the client and server projects. It also installs Husky for our pre-commit checks, and generates the Prisma client library for the back-end. You only need to run this command in the [root](.) directory on clone, but if a new package is added to any of the [package.json](package.json) files, or the [Prisma schema](./server/prisma/schema.prisma) is updated you will need to run it again.

> [!CAUTION]
> The `node_modules` directory should never be committed to git or any other version control system

### Setting Up Services

The recommended way to set up the project services is to use the [container setup](./containers/user-guide.md), as it will allow everyone to use the same version of the tools, with the same data loaded.

Using the containerized services also has the benefit of taking values from your environment file, so there is no need to cross reference data between the services and the [.env](#set-environment-variables) file.

If you really don't want to use the containerized services, you can manually download and configure the software on your device. Although, this is more prone to user error, and more complex to do.

### Set Environment Variables

Environment files allow for sensitive info to be given to the app without adding it to git. These environment variables are stored in a `.env` file, which should look something like this:

```sh
NODE_ENV=development
PORT=3000
DB_USER=root
DB_PASS=<password>
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=lfg
S3_USER=app
S3_PASS=<password>
S3_HOST=127.0.0.1
S3_PORT=9000
S3_CONSOLE_PORT=9001
S3_BUCKET=lfgrp
```

- `NODE_ENV` should be `development` when working locally
- `PORT` can be set to any open port you want, `3000` is standard for development
- `DB_USER` is `root` because that is the default mysql user for local development
- `DB_PASS` should have the password value for the root user of your mysql db
- `DB_HOST` is the ip that hosts the db, `127.0.0.1` for development
- `DB_PORT` is the port value your mysql is running on, `3306` is MySQL's default
- `DB_NAME` is the name of the database to access, `lfg` for us
- `S3_USER` is the username of the s3 account the app uses, `app` is a fine default
- `S3_PASS` is the password of the s3 account the app uses, must be 8+ characters
- `S3_HOST` is the ip that hosts the s3 server, `127.0.0.1` for development
- `S3_PORT` is the port the s3 server is available on, `9000` is minio's default
- `S3_CONSOLE_PORT` is the port for the s3 dev console, which is optional, and defaults to `9001`
- `S3_BUCKET` is the name of the s3 bucket, this should be `lfgrp` to match the [policy](./containers/services/s3/policies/app-crud-perms.json)

> [!CAUTION]
> Environment files like `.env` should never be committed to git or any other version control system

## Development

### Running The Project

To run in dev mode, all you need to do is run the following command in the [root](.) directory:

```bash
npm run dev
```

This will concurrently start the client project dev server, and run nodemon on the server. This means when the client is changed, it will hot reload. The same happens with the server. The client dev server also creates a proxy to the express server, so any requests to the `/api` path on the client will forward the request to the server.

### Husky Pre-Commit Checks

Once you go to commit a file, you might notice it takes a bit longer than normal. That is because of [Husky](https://typicode.github.io/husky/), which allows us to run code when you go to commit. The config file for which files get what commands run on them is [.lintstagedrc.js](./.lintstagedrc.js).

#### Husky For The Server

For server files, Husky will check them with [ESLint](#linting), then with [Prettier](#formatting).

If your commit fails with an ESLint error, take a look back through your code to see if there are any missed ESLint errors that you need to fix.

If a Prettier error occurs, check to make sure your files don't have any syntax errors. Also make sure that if you are adding a new file type that isn't supported by Prettier, you update the [Prettier Ignore](./server/.prettierignore) to include it.

## Linting

Both our client and server are set up with ESLint based linting. In addition, both have type checking powered by the typescript compiler.

### Server Linting

For the server, the code is a lightweight version of typescript that runs on node via type stripping. This means it doesn't require compilation, but can be typechecked with the typescript compiler. Editors like VSCode should automatically highlight these errors for you, but the following command can be ran in [root](.) to manually typecheck:

```bash
npm run lint:server:types
```

The server also has ESLint based linting. To fix any fixable errors, and display the rest, the following command can be run in [root](.):

```bash
npm run lint:server
```

### Client Linting

The client uses full typescript that must be transpiled and bundled for browsers. Vite will not perform typechecking, but your code editor should be able to highlight any type errors for you. If you want to run a manual typecheck, the following command can be run in [root](.):

```bash
npm run lint:client:types
```

The client also has ESLint based linting. To fix any fixable errors, and display the rest, the following command can be run in [root](.):

```bash
npm run lint:client
```

## Formatting

LFG uses Prettier as its formatter. This allows all the code in each part of the repo to follow rules outlined in a `.prettierrc` file.

### Server Formatting

The server code can be formatted by running the following command in [root](.):

```bash
npm run format:server
```
