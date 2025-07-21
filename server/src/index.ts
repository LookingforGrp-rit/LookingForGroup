import app from '#app.ts';
import envConfig from '#config/env.ts';

const port = envConfig.port;

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
