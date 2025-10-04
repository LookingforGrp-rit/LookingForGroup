import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { uidHeaderKey } from '#config/constants.ts';
import { getUsernameByShib } from '#controllers/me/get-username-shib.ts';
import { getUserByShibService } from '#services/me/get-user-shib.ts';
import { blankAuthUserRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankUserPreview } from '#tests/resources/blanks/users.ts';

vi.mock('#services/users/get-user/get-username-shib.ts');

//dummy req
const req = blankAuthUserRequest;

//dummy resp
const res = blankResponse;

describe('getUsernameByShib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  //university id missing, should return 404
  test('Must return 400 when the uid is missing', async () => {
    req.headers[uidHeaderKey] = undefined;

    vi.mocked(getUserByShibService).mockResolvedValue('INTERNAL_ERROR');
    expect(getUserByShibService).toBe(vi.mocked(getUserByShibService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getUsernameByShib(req, res);
    expect(getUserByShibService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getUserByShibService).mockResolvedValue('INTERNAL_ERROR');
    expect(getUserByShibService).toBe(vi.mocked(getUserByShibService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getUsernameByShib(req, res);
    expect(getUserByShibService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //no projects found, should return 404
  test('Must return 404 when no projects could be found', async () => {
    vi.mocked(getUserByShibService).mockResolvedValue('NOT_FOUND');
    expect(getUserByShibService).toBe(vi.mocked(getUserByShibService));
    const resBody = {
      status: 404,
      error: 'User not found',
      data: null,
    };

    await getUsernameByShib(req, res);
    expect(getUserByShibService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getUserByShibService).mockResolvedValue(blankUserPreview);
    expect(getUserByShibService).toBe(vi.mocked(getUserByShibService));
    const resBody = {
      status: 200,
      error: null,
      data: blankUserPreview,
    };

    await getUsernameByShib(req, res);
    expect(getUserByShibService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
