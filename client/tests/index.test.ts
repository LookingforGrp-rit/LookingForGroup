import { afterAll, beforeAll, expect, test } from "vitest";
import util from "../src/api/index.js";
import { startTestServer, stopTestServer } from "./server-management";

beforeAll(startTestServer);

afterAll(stopTestServer);

/*
 * Test basic gets
 */
test("local: Test gets users", async () => {
  const result = await util.GET("/users");
  expect(result.status).toBe(200);
});

// test("remote: Test gets users", async () => {
//   const apiURL = `https://lfg.gccis.rit.edu/api/api/users`;
//   const result = await util.GET(apiURL);
//   //console.log(result);
//   expect(result.status).toBe(200);
// });

test("local: Test gets projects", async () => {
  const result = await util.GET("/projects");
  expect(result.status).toBe(200);
});
