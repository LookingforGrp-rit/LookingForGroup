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

vi.mock('#services/users/create-user.ts', () => ({
  createUserService: vi.fn(),
}));

vi.mock('#services/users/get-user/get-by-username.ts', () => ({
  getUserByUsernameService: vi.fn(),
}));

vi.mocked(createUserService).mockResolvedValue('INTERNAL_ERROR');
vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');

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

  test('should return 500 if createUserService returns INTERNAL_ERROR', async () => {
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
  });
});
