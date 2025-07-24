import app from '#app.ts';
import envConfig from '#config/env.ts';

const port = envConfig.port;

const server = app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server successfully closed');
    process.exit(0);
  });
});
