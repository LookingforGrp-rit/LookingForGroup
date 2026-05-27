# Builds the docker image of the server side of the project

#######################
# base Node.js layer
#######################
# node:20-slim should be compatable with Prisma
FROM node:20-slim AS base

#######################
# system dependencies
#######################
# required for Prisma and some Node packages
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl


WORKDIR /app

#######################
# Install dependencies
#######################
# makes sure installs dont re-run unless chnages
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
COPY shared/package.json ./shared/package.json

# run clean install
RUN npm ci

#######################
# Copy full project source code
#######################
COPY . .

#######################
# Generate Prisma Client
#######################
# creates the prisma client based on server/prisma/schema.prisma
RUN npx prisma generate --schema=server/prisma/schema.prisma

#######################
# Build frontend
#######################
# Compiles react and vite into assets
# Will be served by backend
RUN npm run build

#######################
# Environment variables
#######################
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_NAME=lfg

EXPOSE 3000

#######################
# Start server
#######################
CMD ["npm", "run", "start"]
