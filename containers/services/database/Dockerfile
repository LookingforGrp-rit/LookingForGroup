FROM mysql:8.4.5

ENV MYSQL_DATABASE=lfg

COPY lfg_all_datasets.sql /tmp/dump.sql
COPY import.sh /docker-entrypoint-initdb.d/01-import.sh