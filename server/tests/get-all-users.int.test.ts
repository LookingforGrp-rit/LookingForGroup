//integration tests, check actual connections to database

//import { getAllUsers } from "#controllers/users/get-all.ts"
import { expect, it } from 'vitest';
import { getAllUsersService } from '#services/users/get-all-users.ts';

it('DEBUG: prints all users NO MOCKS! IF this doesnt work, database error.', async () => {
  const result = await getAllUsersService({ strictness: null });

  //console.log('USERS FROM SERVICE:',result);
  expect(result.length).toBeGreaterThan(0);
  expect(result).toBeDefined();
});

//test for each field we need.
it('DEBUG: returns required preview fields, if we change user fields change this!', async () => {
  const result = await getAllUsersService({ strictness: null });

  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);

  //JUST EDIT THIS!
  const requiredKeys = [
    'userId',
    'firstName',
    'lastName',
    'username',
    'headline',
    'pronouns',
    'location',
    'title',
    'funFact',
    'mentor',
    'developer',
    'designer',
  ];

  const user = result[0];

  for (const key of requiredKeys) {
    expect(user).toHaveProperty(key);
  }

  expect(user).toHaveProperty('majors');
});
