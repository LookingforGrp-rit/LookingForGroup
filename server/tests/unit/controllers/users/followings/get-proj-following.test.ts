import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getProjectsFollowing } from '#controllers/users/followings/get-proj-following.ts';
import { getProjectFollowingService } from '#services/users/followings/get-proj-following.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectFollowsList } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/users/followings/get-proj-following.ts');

//dummy req
const req = blankIdRequest;

//dummy resp
const res = blankResponse;

describe('getProjectsFollowing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getProjectFollowingService).mockResolvedValue('INTERNAL_ERROR');
    expect(getProjectFollowingService).toBe(vi.mocked(getProjectFollowingService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getProjectsFollowing(req, res);
    expect(getProjectFollowingService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //no projects followed, should return 404
  test('Must return 404 when no projects are followed', async () => {
    vi.mocked(getProjectFollowingService).mockResolvedValue('NOT_FOUND');
    expect(getProjectFollowingService).toBe(vi.mocked(getProjectFollowingService));
    const resBody = {
      status: 404,
      error: 'No projects followed',
      data: null,
    };

    await getProjectsFollowing(req, res);
    expect(getProjectFollowingService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getProjectFollowingService).mockResolvedValue(blankProjectFollowsList);
    expect(getProjectFollowingService).toBe(vi.mocked(getProjectFollowingService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectFollowsList,
    };

    await getProjectsFollowing(req, res);
    expect(getProjectFollowingService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
