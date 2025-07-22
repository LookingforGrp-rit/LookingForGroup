import { afterAll, beforeAll, expect, test } from "vitest";
import util from "../src/api/projects.ts";
import { startTestServer, stopTestServer } from "./server-management.ts";

beforeAll(startTestServer);

afterAll(stopTestServer);

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
// USERS
// GETs

/**
 * getProjects
 */
test("Test getProjects, local. 1: Test status. 2: Test data.", async () => {
  const result = await util.getProjects();
  //console.log(result);
  expect(result.status).toBe(200);
  expect(result.data).toBeDefined();
});

/**
 * getByID
 */
test("Test getByID, local. 1: Test status. 2: Test data.", async () => {
  const result = await util.getByID(1);
  //console.log(result);
  expect(result.status).toBe(200);
  expect(result.data).toBeDefined();
});

/**
 * getPics
 */
test("Test getPics, local. 1: Test status. 2: Test data.", async () => {
  const result = await util.getPics(1);
  //console.log(result);
  expect(result.status).toBe(200);
  expect(result.data).toBeDefined();
});

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
// POSTs

/**
 * createNewProject
 */
// test('Test createNewProject, local. 1: Test status. 2: Test data transferred.', async () => {
//   const userid = 1;
//   const title = 'TestingProject';
//   const hook = 'just testing';
//   const desc = '';
//   const projecttype = [1,''];
//   const tags =
//   const member = [1];
//   const result = await util.createNewProject(userid,title,hook,desc,'','','',projecttype,tags,[],member,[])
// });

/**
 * addPic
 */
// test('Test addPic. 1: test add/status. 2: test get.', async () => {
//   const id = 5;
//   const image = new File([],'');
//   const position = 0;
//   const response = await util.addPic(id,image,position);
//   console.log(response);
//   expect(response.status).toBe(200);

// });

/**
 * addMember
 */
// test("Test addMember. 1: test add/status. 2: test get.", async () => {
//   const id = 5;
//   const user = 1;
//   const title = 1;
//   const permission = 3;
//   const response = await util.addMember(id, user, title, permission);
//   console.log(response);
//   expect(response.status).toBe(200);
// });

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
// PUTs

/**
 * updateProject
 */
// test("Test updateProject. 1: change name and check status. 2: check changed information.", async () => {
//   const data = {
//     title: "Mistah Bones' Wild Ride",
//   };
//   const id = 5;
//   const response = await util.updateProject(id, data);
//   console.log(response);
//   expect(response.status).toBe(200);
//   expect(response.data).toBeDefined();
// });

/**
 * updatePicPositions
 */
// test("Test updatePicPositions. 1: change picture and check status. 2: check changed information.", async () => {
//   const id = 5;
//   const images = new Array<{ id: 1; position: 0 }>();
//   const response = await util.updatePicPositions(id, images);
//   console.log(response);
//   expect(response.status).toBe(200);
// });

/**
 * updateMember
 */
// test("Test updateMember. 1: change user id. 2: check changed information.", async () => {
//   const id = 5;
//   const user = 1;
//   const title = 2;
//   const permission = 1;
//   const response = await util.updateMember(id, user, title, permission);
//   console.log(response);
//   expect(response.status).toBe(200);
// });

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
// DELETEs

/**
 * deleteProject
 */
// test("Test deleteProject. 1: Test delete. 2: Test no response for getProject.", async () => {
//   const id = 5;
//   const response = await util.deleteProject(id);
//   console.log(response);
//   expect(response.status).toBe(200);

//   const afterwords = await util.getByID(id);
//   console.log(afterwords);
//   expect(response.data).toBeUndefined();
// });

/**
 * deletePic
 */
// test("Test deletePic. 1: Test delete. 2: Test no response for getPic.", async () => {
//   const id = 5;
//   const image = "";
//   const response = await util.deletePic(id, image);
//   console.log(response);
//   expect(response.status).toBe(200);
// });

/**
 * deleteMember
 */
// test("Test deleteMember. 1: Test delete. 2: Test no response for getMember.", async () => {
//   const id = 5;
//   const userId = 1;
//   const response = await util.deleteMember(id, userId);
//   console.log(response);
//   expect(response.status).toBe(200);
// });
