FROM minio/minio:RELEASE.2025-07-23T15-54-02Z

RUN curl -sSL https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/bin/mc && \
    chmod +x /usr/bin/mc

COPY policies/ /policies/
COPY init-images/ /init-images/

COPY entrypoint.sh /usr/bin/entrypoint.sh

RUN chmod +x /usr/bin/entrypoint.sh

ENTRYPOINT ["/usr/bin/entrypoint.sh"]