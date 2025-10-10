import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getUserFollowers } from '#controllers/users/followings/get-user-followers.ts';
import { getUserFollowersService } from '#services/users/followings/get-user-followers.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankUserFollowsList } from '#tests/resources/blanks/users.ts';

vi.mock('#services/users/followings/get-user-followers.ts');

//dummy req
const req = blankIdRequest;

//dummy resp
const res = blankResponse;

describe('getUserFollowers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getUserFollowersService).mockResolvedValue('INTERNAL_ERROR');
    expect(getUserFollowersService).toBe(vi.mocked(getUserFollowersService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getUserFollowers(req, res);
    expect(getUserFollowersService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //no users followed, should return 404
  test('Must return 404 when no users are followed', async () => {
    vi.mocked(getUserFollowersService).mockResolvedValue('NOT_FOUND');
    expect(getUserFollowersService).toBe(vi.mocked(getUserFollowersService));
    const resBody = {
      status: 404,
      error: 'Followers for user not found',
      data: null,
    };

    await getUserFollowers(req, res);
    expect(getUserFollowersService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getUserFollowersService).mockResolvedValue(blankUserFollowsList);
    expect(getUserFollowersService).toBe(vi.mocked(getUserFollowersService));
    const resBody = {
      status: 200,
      error: null,
      data: blankUserFollowsList,
    };

    await getUserFollowers(req, res);
    expect(getUserFollowersService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
