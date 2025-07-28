#!/bin/sh

minio server /data --console-address ":9001" &
MINIO_PID=$!

# Graceful shutdown
terminate() {
  kill -TERM "$MINIO_PID"
  wait "$MINIO_PID"
  exit 0
}

# Trap termination signals and forward to MinIO
trap terminate TERM INT

SETUP_MARKER="/data/.minio-init-complete"

if [ ! -f "$SETUP_MARKER" ]; then
  until curl -sSf http://localhost:9000/minio/health/ready > /dev/null; do
    sleep 1
  done

  # Set defaults safely
  S3_BUCKET="${S3_BUCKET:-lfgrp}"
  S3_USER="${S3_USER:-devuser}"
  S3_PASS="${S3_PASS:-devpass}"

  # Set alias for local instance
  mc alias set local http://localhost:9000 minioadmin minioadmin

  # Create bucket if not exists
  mc mb "local/$S3_BUCKET"

  # Upload init files if any
  mc cp --recursive /init-images/ "local/$S3_BUCKET/"

  # Create user if not exists
  mc admin user add local "$S3_USER" "$S3_PASS"

  # Create and attach policy
  mc admin policy create local lfg-crud /policies/app-crud-perms.json
  mc admin policy attach local lfg-crud --user "$S3_USER"

  # Mark setup as complete
  touch "$SETUP_MARKER"
fi

# Wait for MinIO to exit (after trap handles signal)
wait "$MINIO_PID"
