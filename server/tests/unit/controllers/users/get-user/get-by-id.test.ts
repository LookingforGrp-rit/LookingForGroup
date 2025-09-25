import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getUserById } from '#controllers/users/get-user/get-by-id.ts';
import { getUserByIdService } from '#services/users/get-user/get-by-id.ts';
import { blankGetUserRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankUserDetail } from '#tests/resources/blanks/users.ts';

vi.mock('#services/users/get-user/get-by-id.ts');

//dummy req
const req = blankGetUserRequest;

//dummy resp
const res = blankResponse;

describe('getUserById', () => {
  beforeEach(() => {
    vi.mocked(getUserByIdService).mockClear();
  });
  afterEach(() => {
    vi.mocked(getUserByIdService).mockClear();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getUserByIdService).mockResolvedValue('INTERNAL_ERROR');
    expect(getUserByIdService).toBe(vi.mocked(getUserByIdService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getUserById(req, res);
    expect(getUserByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //no projects found, should return 404
  test('Must return 404 when no projects could be found', async () => {
    vi.mocked(getUserByIdService).mockResolvedValue('NOT_FOUND');
    expect(getUserByIdService).toBe(vi.mocked(getUserByIdService));
    const resBody = {
      status: 404,
      error: 'User not found',
      data: null,
    };

    await getUserById(req, res);
    expect(getUserByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getUserByIdService).mockResolvedValue(blankUserDetail);
    expect(getUserByIdService).toBe(vi.mocked(getUserByIdService));
    const resBody = {
      status: 200,
      error: null,
      data: blankUserDetail,
    };

    await getUserById(req, res);
    expect(getUserByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
