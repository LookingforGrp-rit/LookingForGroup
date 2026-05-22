# Builds the docker image of the server side of the project

#####################
# base Nodejs layer #
######################################################################
FROM node:24-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl
#RUN apt-get install mysql

###################################################`
# prisma-client Import the developer prisma files #
######################################################################
FROM base AS prisma-client

WORKDIR /prisma

COPY package.json package-lock.json ./
COPY ./server/package.json ./server/package.json
COPY ./server/prisma/schema.prisma ./server/prisma/schema.prisma

RUN npm ci --workspace=server --ignore-scripts

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

###### MARIADB / MYSQL ######
COPY ./server/docker_setup ./setup_conf
#RUN groupadd -r mysql && useradd -r -g mysql mysql --home-dir /var/lib/mysql
#RUN mkdir -p /var/lib/mysql/mysql ;\
#  touch /var/lib/mysql/mysql/user.frm ;\
#  apt-get install -y --no-install-recommends mariadb-server mariadb-backup socat ;\
#  rm -rf /var/lib/apt/lists/* ;\
#  mkdir db ;\
#  mkdir db/lookingfordata ;\
## From Mariadb Git Repo: https://github.com/MariaDB/mariadb-docker/blob/3fbf86c7b9301bcb6b0dc0f4f478800ee458224f/12.3/Dockerfile#L13
## purge and re-create /var/lib/mysql with appropriate ownership
#  rm -rf /var/lib/mysql; \
#  mkdir -p /var/lib/mysql /run/mysqld; \
#  chown -R mysql:mysql /var/lib/mysql /run/mysqld; \
## ensure that /run/mysqld (used for socket and lock files) is writable regardless of the UID our mysqld instance ends up having at runtime
#  chmod 1777 /run/mysqld ;\
## comment out a few problematic configuration values
#  find /etc/mysql/ -name '*.cnf' -print0 \
#    | xargs -0 grep -lZE '^(bind-address|log|user\s)' \
#    | xargs -rt -0 sed -Ei 's/^(bind-address|log|user\s)/#&/'; \
## don't reverse lookup hostnames, they are usually another container
#  printf "[mariadb]\nhost-cache-size=0\nskip-name-resolve\n" > /etc/mysql/mariadb.conf.d/05-skipcache.cnf; \
## Issue #327 Correct order of reading directories /etc/mysql/mariadb.conf.d before /etc/mysql/conf.d (mount-point per documentation)
#  if [ -L /etc/mysql/my.cnf ]; then \
#    sed -i -e '/includedir/ {N;s/\(.*\)\n\(.*\)/\n\2\n\1/}' /etc/mysql/mariadb.cnf; \
#  fi
## OPTIONAL if you want to add config options to Mariadb/Mysql server
##COPY ./server/maria.cnf ./etc/my.cnf
#RUN mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql ;\
#  update-rc.d mariadb defaults 95 10 ;\
#  service mariadb start ;\
#  mariadb -u root < ./setup_conf/setup.sql ;\
#  mariadb lfg < ./setup_conf/dev_server.sql ;
#
####### END MARIADB / MYSQL ######

#Does not work for railway
#RUN --mount=type=secret,id=DB_USER,env=DB_USER
#RUN --mount=type=secret,id=DB_PASS,env=DB_PASS
#RUN --mount=type=secret,id=DB_HOST,env=DB_HOST
#RUN --mount=type=secret,id=DB_PORT,env=DB_PORT


ENV NODE_ENV=production
ENV PORT=3000
ENV DB_NAME=lfg

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 lfg

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
