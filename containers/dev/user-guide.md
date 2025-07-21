# User Guide

This is the user guide for setting up services powered by [Docker][1].

- [Intro](#intro)
- [Usage](#usage)

## Intro

### What is Docker?

> Docker is a tool that is used to automate the deployment of applications in lightweight [containers](<https://en.wikipedia.org/wiki/Containerization_(computing)>), so that applications can work efficiently in different environments in isolation.
>
> <cite>[Wikipedia](<https://en.wikipedia.org/wiki/Docker_(software)>)</cite>

### How does LFG use Docker during development?

Currently, LFG only uses docker for our MySQL Database, however, we may use it for other tools such as Redis, or mocking using cloud image storage. Using Docker for these pieces of software allow us to easily create an environment that is similar to the production environment, but on your local machine.

## Usage

The process to set up containerized services is fairly simple. You only really need to run a few commands, and Docker will take care of the rest.

> [!Note]
> The containerized services will use the details from your [.env file][5], so there is no extra configuration to do.

### Prerequisites

The only prerequisite is to download [Docker][1]. The easiest way to do this is with [Docker Desktop][2], as it comes packaged with all the tools you need.

> [!Tip]
> Your IDE might have an extension that provides Docker support. If it does, it is recommended to get it. [Check here][3].

### Starting the services

To build and start the services, you can use the `compose:up` npm script. This script will build any containers that are missing, and start any that are spun down. It will also **rebuild containers when a new image is detected, causing old data to be deleted**.

If you have containers spun down already, and don't want to trigger a rebuild, you can use `compose:start`. This wont replace any missing containers, so it is only recommended to do this if you need to preserve data before an update.

> [!Caution]
> Using `compose:up` when there is a new image will delete your old data. This is intended as a new image could mean new schema, or a more populated dummy db, so it is recommended that you update as soon as possible.

### Stopping the services

Once you are done using them, you can stop the services. There are two ways to do this: stopping the containers, and deleting them.

Stopping a container will simply spin it down, but keep the data preserved. The `compose:stop` script will do this for you.

To fully delete the containers, you can use the `compose:down` npm script, but this will **permanently delete all data in the containers**.

You may pick whichever you feel is correct, but just make sure to not leave the services on, as you will be wasting system resources otherwise.

## Final notes

With this read through, you should be all ready to develop using containers. If you got a IDE extension, you might be able to avoid needing to type the commands, so try it out and see if you like it!

Reach out to a @LookingforGrp-rit/DevOps team member if you need any assistance.

[1]: https://www.docker.com/
[2]: https://www.docker.com/products/docker-desktop/
[3]: https://www.docker.com/products/ide/
[4]: ../../
[5]: ../../.env
