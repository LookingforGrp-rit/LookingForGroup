const envConfig = Object.freeze({
  env: process.env.NODE_ENV ?? ('production' as 'production' | 'development' | 'test'),
  databaseUrl: `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  port: process.env.PORT ?? 3000,
});

export default envConfig;
