FROM mysql:8.4.5

ENV MYSQL_DATABASE=lfg

COPY schema_only.sql /tmp/schema.sql
COPY lfg_all_datasets.sql /tmp/datasets.sql
COPY import.sh /docker-entrypoint-initdb.d/01-import.sh