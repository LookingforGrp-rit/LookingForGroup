import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import getProjectByIdController from '#controllers/projects/get-proj-id.ts';
import getProjectByIdService from '#services/projects/get-proj-id.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectWithFollowers } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/get-proj-id.ts');

//dummy req
const req = blankIdRequest;

//dummy resp
const res = blankResponse;

describe('getProjectById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //there's something wrong with the update project service, should return 500
  test('Must return 500 when the update project service errors', async () => {
    vi.mocked(getProjectByIdService).mockResolvedValue('INTERNAL_ERROR');
    expect(getProjectByIdService).toBe(vi.mocked(getProjectByIdService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getProjectByIdController(req, res);
    expect(getProjectByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the update project service, should return 500
  test('Must return 404 when the project could not be found', async () => {
    vi.mocked(getProjectByIdService).mockResolvedValue('NOT_FOUND');
    expect(getProjectByIdService).toBe(vi.mocked(getProjectByIdService));
    const resBody = {
      status: 404,
      error: 'Project not found',
      data: null,
    };

    await getProjectByIdController(req, res);
    expect(getProjectByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getProjectByIdService).mockResolvedValue(blankProjectWithFollowers);
    expect(getProjectByIdService).toBe(vi.mocked(getProjectByIdService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectWithFollowers,
    };

    await getProjectByIdController(req, res);
    expect(getProjectByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
