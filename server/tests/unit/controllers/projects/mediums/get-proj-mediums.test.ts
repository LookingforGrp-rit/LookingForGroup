import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import getProjectMediumsController from '#controllers/projects/mediums/get-proj-mediums.ts';
import getProjectMediumsService from '#services/projects/mediums/get-proj-mediums.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectMedium } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/mediums/get-proj-mediums.ts');

//dummy req
const req = blankIdRequest;

//dummy resp
const res = blankResponse;

describe('getProjectMediums', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getProjectMediumsService).mockResolvedValue('INTERNAL_ERROR');
    expect(getProjectMediumsService).toBe(vi.mocked(getProjectMediumsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getProjectMediumsController(req, res);
    expect(getProjectMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //project could not be found, return 404
  test('Must return 404 when the project could not be found', async () => {
    vi.mocked(getProjectMediumsService).mockResolvedValue('NOT_FOUND');
    expect(getProjectMediumsService).toBe(vi.mocked(getProjectMediumsService));
    const resBody = {
      status: 404,
      error: 'Project not found',
      data: null,
    };

    await getProjectMediumsController(req, res);
    expect(getProjectMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
  //everything's good, return 200
  test('Must return 200 when the mediums were retrieved successfully', async () => {
    vi.mocked(getProjectMediumsService).mockResolvedValue([blankProjectMedium]);
    expect(getProjectMediumsService).toBe(vi.mocked(getProjectMediumsService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankProjectMedium],
    };

    await getProjectMediumsController(req, res);
    expect(getProjectMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
