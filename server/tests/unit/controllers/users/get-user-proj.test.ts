import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getOtherUserProjects } from '#controllers/users/get-user-proj.ts';
import { getUserProjectsService } from '#services/users/get-user-proj.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectPreview } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/users/get-user-proj.ts');

//dummy req
const req = blankIdRequest;

//dummy resp
const res = blankResponse;

describe('getOtherUserProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getUserProjectsService).mockResolvedValue('INTERNAL_ERROR');
    expect(getUserProjectsService).toBe(vi.mocked(getUserProjectsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getOtherUserProjects(req, res);
    expect(getUserProjectsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //no projects found, should return 404
  test('Must return 404 when no projects could be found', async () => {
    vi.mocked(getUserProjectsService).mockResolvedValue('NOT_FOUND');
    expect(getUserProjectsService).toBe(vi.mocked(getUserProjectsService));
    const resBody = {
      status: 404,
      error: 'No projects for this user or user private',
      data: null,
    };

    await getOtherUserProjects(req, res);
    expect(getUserProjectsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getUserProjectsService).mockResolvedValue([blankProjectPreview]);
    expect(getUserProjectsService).toBe(vi.mocked(getUserProjectsService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankProjectPreview],
    };

    await getOtherUserProjects(req, res);
    expect(getUserProjectsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
