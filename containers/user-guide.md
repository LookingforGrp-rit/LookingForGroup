# User Guide

This is the user guide for setting up services powered by [Containers][1].

- [Intro](#intro)
- [Usage](#usage)

## Intro

### What is Containerization?

> In software engineering, containerization is operating-system-level virtualization or application-level virtualization over multiple network resources so that software applications can run in isolated user spaces called containers in any cloud or non-cloud environment, regardless of type or vendor.
>
> <cite>[Wikipedia][1]</cite>

### How does LFG use containers during development?

Currently, LFG uses containers for our MySQL Database and Minio. Using containers for these pieces of software allow us to easily create an environment that is similar to the production environment, but on your local machine. They also allow for us to provide data for devs to use, without any extra configuration.

## Usage

The process to set up containerized services is fairly simple. You only really need to run a few commands, and we will take care of the rest.

> [!Note]
> The containerized services will use the details from your [.env file][5], so there is no extra configuration to do.

### Prerequisites

The only prerequisite is to download a container engine.

#### Windows/Mac Os

On Windows/Mac Os, the easiest way to get started is [Docker Desktop][2]. It will provide you with everything you need, and will work right out of the box. I wouldn't consider any other engine for these platforms, because they don't have the same maturity as Docker.

#### Linux

If you are on Linux, you have two main options. The first is to use the [Docker Engine][6]. I recommend using the Docker Engine instead of Docker Desktop because the desktop app creates a VM, which is extra overhead compared to using the engine directly.

The second option is [Podman][7]. This is a rootless and daemonless container engine that provides better security and performance compared to Docker. The only reason it isn't the primary recommendation is because it lacks support for compose files out of the box. If you want to use it, you will need to add Docker compatibility, and compose support. Once that is done, you can continue with the guide.

> [!Tip]
> Your IDE might have an extension/tool that provides Container support. If it does, it is recommended to get it.

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

[1]: https://en.wikipedia.org/wiki/Containerization_(computing)
[2]: https://www.docker.com/products/docker-desktop/
[4]: ../
[5]: ../.env
[6]: https://docs.docker.com/engine/
[7]: https://podman.io/
