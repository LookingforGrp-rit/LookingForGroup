import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getUserFollowing } from '#controllers/users/followings/get-user-following.ts';
import { getUserFollowingService } from '#services/users/followings/get-user-following.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankUserPreview } from '#tests/resources/blanks/users.ts';

vi.mock('#services/users/followings/get-user-following.ts');

//dummy req
const req = blankIdRequest;

//dummy resp
const res = blankResponse;

describe('getUserFollowing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //user has a non-numerical id, should return 400
  test('Must return 400 when user id is invalid', async () => {
    req.params.id = 'not a number either';
    const resBody = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };

    await getUserFollowing(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1'; //resetting it for the next test
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getUserFollowingService).mockResolvedValue('INTERNAL_ERROR');
    expect(getUserFollowingService).toBe(vi.mocked(getUserFollowingService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getUserFollowing(req, res);
    expect(getUserFollowingService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //no users followed, should return 404
  test('Must return 404 when no users are followed', async () => {
    vi.mocked(getUserFollowingService).mockResolvedValue('NOT_FOUND');
    expect(getUserFollowingService).toBe(vi.mocked(getUserFollowingService));
    const resBody = {
      status: 404,
      error: 'Following for user not found',
      data: null,
    };

    await getUserFollowing(req, res);
    expect(getUserFollowingService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getUserFollowingService).mockResolvedValue([blankUserPreview]);
    expect(getUserFollowingService).toBe(vi.mocked(getUserFollowingService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankUserPreview],
    };

    await getUserFollowing(req, res);
    expect(getUserFollowingService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
