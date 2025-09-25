import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getUserByUsername } from '#controllers/users/get-user/get-by-username.ts';
import { getUserByUsernameService } from '#services/users/get-user/get-by-username.ts';
import { blankGetUserRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankUserPreview } from '#tests/resources/blanks/users.ts';

vi.mock('#services/users/get-user/get-by-username.ts');

//dummy req
const req = blankGetUserRequest;

//dummy resp
const res = blankResponse;

describe('getUserByUsername', () => {
  beforeEach(() => {
    vi.mocked(getUserByUsernameService).mockClear();
  });
  afterEach(() => {
    vi.mocked(getUserByUsernameService).mockClear();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getUserByUsernameService).mockResolvedValue('INTERNAL_ERROR');
    expect(getUserByUsernameService).toBe(vi.mocked(getUserByUsernameService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getUserByUsername(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //no projects found, should return 404
  test('Must return 404 when no projects could be found', async () => {
    vi.mocked(getUserByUsernameService).mockResolvedValue('NOT_FOUND');
    expect(getUserByUsernameService).toBe(vi.mocked(getUserByUsernameService));
    const resBody = {
      status: 404,
      error: 'User not found',
      data: null,
    };

    await getUserByUsername(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getUserByUsernameService).mockResolvedValue(blankUserPreview);
    expect(getUserByUsernameService).toBe(vi.mocked(getUserByUsernameService));
    const resBody = {
      status: 200,
      error: null,
      data: blankUserPreview,
    };

    await getUserByUsername(req, res);
    expect(getUserByUsernameService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
