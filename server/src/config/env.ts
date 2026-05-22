const envConfig = Object.freeze({
  env: (process.env.NODE_ENV ?? 'production') as 'production' | 'development' | 'test',
  databaseUrl: `mysql://${process.env.DB_USER as string}:${process.env.DB_PASS as string}@${process.env.DB_HOST as string}:${process.env.DB_PORT as string}/${process.env.DB_NAME as string}`,
  s3Endpoint: `http://${process.env.S3_HOST as string}`,
  s3Bucket: process.env.S3_BUCKET as string,
  s3User: process.env.S3_USER as string,
  s3Pass: process.env.S3_PASS as string,
  sessionToken: process.env.S3_SESSION as string,
  port: process.env.PORT ?? 3000,
  modId: process.env.MOD_ID,
});

export default envConfig;
