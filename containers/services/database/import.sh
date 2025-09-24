mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "
  DROP DATABASE IF EXISTS lfg;
  CREATE DATABASE lfg;
  USE lfg;
  SOURCE /tmp/schema.sql;
  SOURCE /tmp/datasets.sql;
"