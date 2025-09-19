import type { Request, Response } from 'express';
import { vi, describe, test, expect } from 'vitest';
import {
  uidHeaderKey,
  firstNameHeaderKey,
  lastNameHeaderKey,
  emailHeaderKey,
} from '#config/constants.ts';
import { createUser } from '#controllers/users/create-user.ts';
import { createUserService } from '#services/users/create-user.ts';
import { getUserByUsernameService } from '#services/users/get-user/get-by-username.ts';
import { blankMePrivate } from '../../blanks/me.ts'; //the double ../ is killing me but 'tis what it is
import { blankUserPreview } from '../../blanks/users.ts';

vi.mock('#services/users/create-user.ts', () => ({
  createUserService: vi.fn(),
}));

vi.mock('#services/users/get-user/get-by-username.ts', () => ({
  getUserByUsernameService: vi.fn(),
}));

describe('createUser', () => {
  const req = {
    headers: {
      [uidHeaderKey]: '000000001',
      [firstNameHeaderKey]: 'firstname',
      [lastNameHeaderKey]: 'lastname',
      [emailHeaderKey]: 'email@rit.edu',
    },
    body: {
      username: 'username',
    },
    query: {},
  } as unknown as Request;

  const res = {} as unknown as Response;
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);

  //missing user info (400)
  test("should return 400 if there's missing user information", async () => {
    const responseBody = {
      status: 400,
      error: 'Missing information in headers',
      data: null,
    };

    //making it wrong
    req.headers = {};

    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(responseBody);

    //reset
    req.headers = {
      [uidHeaderKey]: '000000001',
      [firstNameHeaderKey]: 'firstname',
      [lastNameHeaderKey]: 'lastname',
      [emailHeaderKey]: 'email@rit.edu',
    };
  });

  //username taken (409)
  test('should return 409 if getUserByUsername service returns a user', async () => {
    vi.mocked(getUserByUsernameService).mockResolvedValue(blankUserPreview);
    const responseBody = {
      status: 409,
      error: 'Username already taken',
      data: null,
    };

    expect(getUserByUsernameService).toBe(vi.mocked(getUserByUsernameService));

    await createUser(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(responseBody);

    vi.mocked(getUserByUsernameService).mockClear();
  });

  //user already exists (409)
  test('should return 409 if user already exists', async () => {
    vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');
    vi.mocked(createUserService).mockResolvedValue('CONFLICT');
    const responseBody = {
      status: 409,
      error: 'Username already taken',
      data: null,
    };

    expect(getUserByUsernameService).toBe(vi.mocked(getUserByUsernameService));
    expect(createUserService).toBe(vi.mocked(createUserService));

    await createUser(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(createUserService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(responseBody);

    vi.mocked(getUserByUsernameService).mockClear();
    vi.mocked(createUserService).mockClear();
  });

  //user creation failed and it's our fault (500)
  test('should return 500 if createUserService returns INTERNAL_ERROR', async () => {
    vi.mocked(createUserService).mockResolvedValue('INTERNAL_ERROR');
    vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');
    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    expect(getUserByUsernameService).toBe(vi.mocked(getUserByUsernameService));
    expect(createUserService).toBe(vi.mocked(createUserService));

    await createUser(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(createUserService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(responseBody);

    vi.mocked(getUserByUsernameService).mockClear();
    vi.mocked(createUserService).mockClear();
  });

  //user creation successful (201)
  test('should return 201 if user was successfully created', async () => {
    vi.mocked(createUserService).mockResolvedValue(blankMePrivate);
    vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');
    const responseBody = {
      status: 201,
      error: null,
      data: blankMePrivate,
    };

    expect(getUserByUsernameService).toBe(vi.mocked(getUserByUsernameService));
    expect(createUserService).toBe(vi.mocked(createUserService));

    await createUser(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(createUserService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(responseBody);

    vi.mocked(getUserByUsernameService).mockClear();
    vi.mocked(createUserService).mockClear();
  });
});
