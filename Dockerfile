# Builds the docker image of the server side of the project

#####################
# base Nodejs layer #
######################################################################
FROM node:24-slim AS base
RUN apt-get update -y && apt-get install -y openssl

###################################################
# prisma-client Import the developer prisma files #
######################################################################
FROM base AS prisma-client

WORKDIR /prisma

COPY package.json package-lock.json ./
COPY ./server/package.json ./server/package.json
COPY ./server/prisma/schema.prisma ./server/prisma/schema.prisma

RUN npm ci --workspace=server --only=dev --ignore-scripts

RUN npm run prisma:generate


################################################
# prod-deps Production dependencies only layer #
######################################################################
FROM base AS prod-deps

WORKDIR /deps

COPY package.json package-lock.json ./
COPY ./server/package.json ./server/package.json

RUN npm ci --workspace=server --omit=dev --ignore-scripts


######################################
# runner Final stage running the app #
######################################################################
FROM base AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 lfg

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY ./server/package.json ./
COPY ./server/src ./src
COPY --from=prisma-client /prisma/server/src/models ./src/models
COPY --from=prod-deps /deps/node_modules ./node_modules

EXPOSE 3000

USER lfg

#ARG src_file="src/index.ts"
#ARG local_dev
#CMD [${src_file:-""}${local_dev:+"npm"}, ${local_dev:+"run"}, ${local_dev:+"dev"}]
CMD ["src/index.ts"]