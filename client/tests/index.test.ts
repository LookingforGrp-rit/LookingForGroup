import { afterAll, beforeAll, expect, test, describe } from "vitest";
import util from "../src/api/index.js";
import { startTestServer, stopTestServer } from "./server-management";

// file found in ./client/src/api/index.ts

beforeAll(startTestServer);

afterAll(stopTestServer);

describe.skip("tests need to be updated", () => {
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
});

// write and check tests for put, post, and delete. This is the main thing we are leaving to fall 2025 group. You'll need to write the basic functions leveraging shibboleth headers and authentication.
