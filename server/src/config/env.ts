const envConfig = Object.freeze({
  env: (process.env.NODE_ENV ?? 'production') as 'production' | 'development' | 'test',
  databaseUrl: `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  s3Endpoint: `${process.env.S3_HOST}:${process.env.S3_PORT}`,
  s3Bucket: `${process.env.S3_BUCKET}`,
  s3User: `${process.env.S3_USER}`,
  s3Pass: `${process.env.S3_PASS}`,
  port: process.env.PORT ?? 3000,
});

export default envConfig;
