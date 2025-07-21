# Dockerfile that builds the Express API image

# Base Nodejs install
FROM node:24-slim AS base

RUN apt-get update -y && apt-get install -y openssl

# Generate the generated prisma client files
FROM base AS prisma-client

WORKDIR /prisma

COPY package.json package-lock.json ./
COPY ./server/package.json ./server/package.json
COPY ./server/prisma/schema.prisma ./server/prisma/schema.prisma

RUN npm ci --workspace=server --only=dev --ignore-scripts

RUN npm run prisma:generate

# Download only the production dependencies
FROM base AS prod-deps

WORKDIR /deps

COPY package.json package-lock.json ./
COPY ./server/package.json ./server/package.json

RUN npm ci --workspace=server --omit=dev --ignore-scripts

# Final stage where app will run
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

CMD ["src/index.ts"]
