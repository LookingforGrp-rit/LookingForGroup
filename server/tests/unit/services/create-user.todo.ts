import type { MePrivate } from '@looking-for-group/shared';
import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import prisma from '#config/__mocks__/prisma.ts';
import { createUserService } from '#services/users/create-user.ts';
import { isMePrivate } from './is-type/me.ts';

// FIXME

vi.mock('#config/prisma.ts');
describe.skip('create user', async () => {
  //const { createUserService } = await import('#services/users/create-user.ts');

  //James Testguy, our test user
  const jamesTestguy = {
    universityId: '123456789',
    username: 'TESTGUY',
    firstName: 'james',
    lastName: 'testguy',
    ritEmail: 'jtg0000@rit.edu',
  } as MePrivate;
  prisma.users.create.mockResolvedValue(jamesTestguy);
  const user = await createUserService(
    jamesTestguy.universityId,
    jamesTestguy.username,
    jamesTestguy.firstName,
    jamesTestguy.lastName,
    jamesTestguy.ritEmail,
  );

  //did it error? it better not we catch those
  test('Must not error', () => {
    expect(user).not.toThrowError();
  });
  //is it returning the right thing?
  test('Must return Object, INTERNAL_ERROR, or CONFLICT', () => {
    expectTypeOf(user).toEqualTypeOf<MePrivate | 'INTERNAL_ERROR' | 'CONFLICT'>();
    expect(user).toEqual(expect.any(Object));
  });
  //is it the right type?
  isMePrivate(user as MePrivate);
  //i don't understand the purpose of this.
  //does this not just always pass?
  // we're literally passing in a MePrivate object (that has to be a MePrivate or else it yells at me)
  //and then that code checks whether or not the MePrivate we just made, that has to be a MePrivate, is in fact a MePrivate
  //like what are we testing for at that point

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
