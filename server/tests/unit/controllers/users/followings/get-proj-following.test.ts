import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getProjectsFollowing } from '#controllers/users/followings/get-proj-following.ts';
import { getProjectFollowingService } from '#services/users/followings/get-proj-following.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectPreview } from '#tests/resources/blanks/projects.ts';

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

  //project has a non-numerical id, should return 400
  test('Must return 400 when project id is invalid', async () => {
    req.params.id = 'not a number either';
    const resBody = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };

    await getProjectsFollowing(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1'; //resetting it for the next test
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

  //there's something wrong with the update project service, should return 500
  test('Must return 404 when the project could not be found', async () => {
    vi.mocked(getProjectFollowingService).mockResolvedValue('NOT_FOUND');
    expect(getProjectFollowingService).toBe(vi.mocked(getProjectFollowingService));
    const resBody = {
      status: 404,
      error: 'Project not found',
      data: null,
    };

    await getProjectsFollowing(req, res);
    expect(getProjectFollowingService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getProjectFollowingService).mockResolvedValue([blankProjectPreview]);
    expect(getProjectFollowingService).toBe(vi.mocked(getProjectFollowingService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankProjectPreview],
    };

    await getProjectsFollowing(req, res);
    expect(getProjectFollowingService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
