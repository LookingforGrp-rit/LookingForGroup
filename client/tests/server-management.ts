import http from "http";
import app from "@looking-for-group/server";

let server: http.Server;
let port: number;

const startTestServer = async () => {
  server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));

  port = (server.address() as { port: number }).port;

  window.TEST_API_URL = `http://localhost:${port}`;
};

const stopTestServer = async () => {
  await new Promise((resolve) => server.close(resolve));
};

export { startTestServer, stopTestServer };
