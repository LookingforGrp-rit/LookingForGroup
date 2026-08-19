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

The [server](./server/) project contains the Express API that provides an interface to our database. We use [MySql](https://www.mysql.com/) as our database, and store image files with [AWS](https://aws.amazon.com/) (Amazon Web Service).

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

Environment files allow for sensitive info to be given to the app without adding it to git. These environment variables are stored in a `.env` file in the `root (/)` folder, which should look something like this:

```sh
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://<user>:<password>@localhost:3306/lfg
S3_USER=<ask the team lead>
S3_PASS=<ask the team lead>
S3_HOST=s3.us-east-2.amazonaws.com
S3_BUCKET=<ask the team lead>
```

- `NODE_ENV` should be `development` when working locally
- `PORT` can be set to any open port you want, `3000` is standard for development
- `DATABASE_URL` is a combination of your mysql username, password, port, and database name
- `S3_USER` is the username of the s3 account the app uses, your team lead should have access to the AWS console and can retrieve this for you
- `S3_PASS` is the password of the s3 account the app uses, your team lead should have access to the AWS console and can retrieve this for you
- `S3_HOST` is the hostname of the AWS server. Our bucket runs on `us-east-2`
- `S3_BUCKET` is kind of similar to the folder name where our files are stored. For security purposes, you'll also need to ask your lead for this

We also have a `.env` file for the `client (/client)` folder that holds info for Google authentication. If you want to be able to log in while in development, you'll need that as well. It looks like this:

```sh
VITE_GOOGLE_CLIENT_ID=596953635459-vsu1ipgmjd9jqvcvj8spv1i076vbdm5s.apps.googleusercontent.com
VITE_API_BASE=http://localhost:4000
```

- `VITE_GOOGLE_CLIENT_ID` is our ID issued from Google so that they know what project is being logged into
- `VITE_API_BASE` is a link to where the API is hosted. The default for development is `http://localhost:4000`

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
