import { afterAll, beforeAll, expect, test } from "vitest";
import util from "../src/api/users.ts";
import { startTestServer, stopTestServer } from "./server-management.ts";

beforeAll(startTestServer);

afterAll(stopTestServer);

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
// USERS
// GETs

/**
 * getUsers
 */
test("Test getUsers, local. 1: Test status. 2: Test information.", async () => {
  const result = await util.getUsers();
  //console.log(result);
  expect(result.status).toBe(200);
  expect(result.data).toBeDefined();
});

/**
 * getUsersById
 */
test("Test getUsersById, local. 1: Test status. 2: Test information.", async () => {
  const result = await util.getUsersById(19);
  //console.log(result);
  expect(result.status).toBe(200);
  expect(result.data).toBeDefined();
});

/**
 * userInDatabase
 */
test("Test userInDatabase, local. 1: Test status. 2: Test invalid.", async () => {
  const result = await util.userInDatabase("lfg1234@rit.edu");
  //console.log(result);
  expect(result).toBe(true);

  const bad = await util.userInDatabase("abcde1992@rit.edu");
  //console.log(bad);
  expect(bad).toBe(false);
});

/**
 * getAccountInformation
 */
test("Test getAccountInformation, local. 1: Test invalid, status, info. 2: Test valid, status, info.", async () => {
  const response = await util.getAccountInformation(19);
  //console.log(response);
  expect(response.data).toBeDefined();
  expect(response.status).toBe(200);
});

/**
 * getUserByUsername
 */
test("Test getUserByUsername, local. 1: Test status. 2: Test data.", async () => {
  const response = await util.getUserByUsername("Mr. LFG");
  // console.log(response);
  expect(response.data).toBeDefined();
  expect(response.status).toBe(200);
});

/**
 * getUserByEmail
 */
test("Test getUserByEmail, local. 1: Test status. 2: Test data.", async () => {
  const response = await util.getUserByEmail("lfg1234@rit.edu");
  // console.log(response);
  expect(response.data).toBeDefined();
  expect(response.status).toBe(200);
});

/**
 * getUserFollowing
 */
test("Test getUserFollowing, local. 1: Test status. 2: Test data.", async () => {
  const response = await util.getUserFollowing(19);
  console.log(response);
  expect(response.data).toBeDefined();
  expect(response.status).toBe(200);
});

/**
 * getVisibleProjects
 */
test("Test getVisibleProjects, local. 1: Test status. 2: Test data.", async () => {
  const response = await util.getVisibleProjects(19);
  //console.log(response);
  expect(response.data).toBeDefined();
  expect(response.status).toBe(200);
});

/**
 * getProjectFollowing
 */
test("Test getProjectFollowing, local. 1: Test status. 2: Test data", async () => {
  const response = await util.getProjectFollowing(19);
  //console.log(response);
  expect(response.data).toBeDefined();
  expect(response.status).toBe(200);
});

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
// POSTs

/**
 * createNewUser
 */
// test('Test createNewUser. 1: Test add and status. 2: test recieving information.', async () => {
//   //how do we test this rn?
// });

/**
 * addUserFollowing
 */
// test('Test addUserFollowing. 1: Test add and status. 2: Test recieving information.', async () => {
//   const id=1;
//   const uid=19;
//   const response = await util.addUserFollowing(id,uid);
//   console.log(response);
//   expect(response.status).toBe(200);
// });

/**
 * addProjectFollowing
 */
// test('Test addProjectFollowing. 1: Test add and status. 2: Test recieving information.', async () => {
//   const id = 19;
//   const pid = 5;
//   const response = await util.addProjectFollowing(id,pid);
//   console.log(response);
//   expect(response.status).toBe(200);
// });

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
// PUTs

/**
 * editUser
 */
// test('Test editUser. 1: Test change and status. 2: Test changed information.', async () => {

// });

/**
 * updateProfiliePicture
 */
// test('Test updateProfilePicture. 1: Test change and status. 2: Test changed information.', async () => {
//   const id = 1;
//   const image = new File([], '');
//   const response = await util.updateProfilePicture(id,image);
//   console.log(response);
//   expect(response.status).toBe(200);
// });

/**
 * updateUsername
 */
// test('Test updateUsername. 1: Test change and status. 2: Test changed information.', async () => {
//   const id = 1;
//   const user = 'misterLFG';
//   const response = await util.updateUsername(id,user,user,'');
//   console.log(response);
//   expect(response.status).toBe(200);

//   const check = await util.getUserByUsername('misterLFG');
//   expect(check.data).toBeDefined;
// });

/**
 * updateUserVisibility
 */
// test('Test updateUserVisibility. 1: Test change and status. 2: Test changed information.', async () => {
//   const id = 2;
//   const response = await util.updateUserVisibility(id);
//   console.log(response);
//   expect(response.status).toBe(200);
// });

/**
 * updateProjectVisibility
 */
// test('Test updateProjectVisibility. 1: Test change and status. 2: Test changed information.', async () => {
//   const id = 1;
//   const project = 5;
//   const vis = 'public';
//   const response = await util.updateProjectVisibility(id,project,vis);
//   console.log(response);
//   expect(response.status).toBe(200);

//   const check = await util.getVisibleProjects(id);
//   expect(check.data).toBeUndefined();
// });

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
// DELETEs;

/**
 * deleteUser
 */
// test('Test deleteUser. 1: Test delete and status. 2: Test no recieves.', async () => {
//   const id = 1;
//   const response = await util.deleteUser(id);
//   console.log(response);
//   expect(response.status).toBe(200);

//   const check = await util.getUsersById(1);
//   expect(check.data).toBeUndefined();
// });

/**
 * deleteUserFollowing
 */
// test('Test deleteUserFollowing. 1:Test delete and status. 2: Test no recieves.', async () => {
//   const id = 19;
//   const uid = 1;
//   const response = await util.deleteUserFollowing(id, uid);
//   console.log(response);
//   expect(response.status).toBe(200);

//   const check = await util.getUserFollowing(id);
//   expect(check.data).toBeUndefined();
// })

/**
 * deleteProjectFollowing
 */
// test('Test deleteProjectFollowing. 1: Test delete and status. 2: Test no recieves.', async () => {
//   const id = 19;
//   const pid = 5;
//   const response = await util.deleteProjectFollowing(id,pid);
//   console.log(response);
//   expect(response.status).toBe(201);

//   const check = await util.getProjectFollowing(id);
//   expect(check.data).toBeUndefined();
// });
