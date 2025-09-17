import type { MePrivate } from '@looking-for-group/shared';
import { describe, expect, test, expectTypeOf } from 'vitest';
import prisma from '#config/prisma.ts';
import createUserService from '#services/users/create-user.ts';
import { mePrivateKeys } from './is-type/keys/me.ts';

describe('create user', async () => {
  //James Testguy, our test user
  const user = await createUserService(
    '123456789',
    'TESTGUY',
    'james',
    'testguy',
    'jtg0000@rit.edu.com',
  );

  //did it error? it better not we catch those
  test('Must not error', () => {
    expect(user).not.toThrowError();
  });
  //is it returning the right thing?
  //(i actually don't know if this checks if it's all of them or either of them)
  test('Must return Object, INTERNAL_ERROR, or CONFLICT', () => {
    expectTypeOf(user).toEqualTypeOf<MePrivate | 'INTERNAL_ERROR' | 'CONFLICT'>();
    expect(user).toEqual(expect.any(Object));
  });
  //is it the right type?
  test('Object must contain all properties in MePrivate type', () => {
    for (const key of mePrivateKeys) {
      expect(user).toHaveProperty(key);
    }
  });
  //are they in the database?
  test('Database must contain the created user', async () => {
    const getHim = await prisma.users.findUnique({
      where: {
        userId: 123456789, //"octal literals are not allowed" with 000000000 id
      },
    });
    expect(getHim).toBeDefined();
  });
  //are there dupes in the database? there shouldn't be
  test('Database must not contain duplicate users', async () => {
    //making sure findMany at the id only returns 1 (there's only one user with that id)
    //this should always be 1 user but JUST in case
    const areThereMore = await prisma.users.findMany({
      where: {
        userId: 123456789,
      },
    });
    expect(areThereMore.length).toBe(1);
  });
});
