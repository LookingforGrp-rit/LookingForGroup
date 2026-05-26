import app from '#app.ts';
//import envConfig from '#config/env.ts';

const port = process.env.PORT || 3000;

const server = app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  // Header to find server startup info (also it looks nice)
  console.log(`
   __             __    _             ___           _____                 
  / /  ___  ___  / /__ (_)__  ___ _  / _/__  ____  / ___/______  __ _____ 
 / /__/ _ \\/ _ \\/  '_// / _ \\/ _ \`/ / _/ _ \\/ __/ / (_ / __/ _ \\/ // / _ \\
/____/\\___/\\___/_/\\_\\/_/_//_/\\_, / /_/ \\___/_/    \\___/_/  \\___/\\___/ .__/
                            /___/                                  /_/  
`);
  console.log('Server started');
  console.log(`Listening on port ${port}`);
});

const server_close = (error?: Error) => {
  if (error) {
    console.log(error);
  }
  console.log('Server closed');
  process.exit(0);
};

process.on('SIGTERM', () => {
  console.log('\nShutting down server');
  server.close(server_close);
});
process.on('SIGINT', () => {
  console.log('\nShutting down server');
  server.close(server_close);
});
