import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  uidHeaderKey,
  firstNameHeaderKey,
  lastNameHeaderKey,
  emailHeaderKey,
} from '#config/constants.ts';
import { createUser } from '#controllers/users/create-user.ts';
import { createUserService } from '#services/users/create-user.ts';
import { getUserByUsernameService } from '#services/users/get-user/get-by-username.ts';
import { blankResponse, blankUserRequest } from '#tests/resources/blanks/extra.ts';
import { blankMePrivate } from '#tests/resources/blanks/me.ts';
import { blankUserPreview } from '#tests/resources/blanks/users.ts';

vi.mock('#services/users/create-user.ts');

vi.mock('#services/users/get-user/get-by-username.ts');

describe('createUser', () => {
  const req = blankUserRequest;
  const res = blankResponse;

  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should return 500 if user validation has an internal error', async () => {
    vi.mocked(getUserByUsernameService).mockResolvedValue('INTERNAL_ERROR');

    const responseBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await createUser(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(createUserService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(responseBody);
  });

  test('should return 201 if createUserService succeeds', async () => {
    vi.mocked(createUserService).mockResolvedValue(blankMePrivate);
    vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');

    const responseBody = {
      status: 201,
      error: null,
      data: blankMePrivate,
    };

    await createUser(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(createUserService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(responseBody);
  });

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

  //user already exists (409)
  test('should return 409 if user already exists', async () => {
    vi.mocked(getUserByUsernameService).mockResolvedValue(blankUserPreview);

    const responseBody = {
      status: 409,
      error: 'Username already taken',
      data: null,
    };

    await createUser(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(createUserService).not.toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(responseBody);
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

    await createUser(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(createUserService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(responseBody);
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
  });
});
