import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import getProjectSocialsController from '#controllers/projects/socials/get-project-socials.ts';
import getProjectSocialsService from '#services/projects/socials/get-project-socials.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectSocial } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/socials/get-project-socials.ts');

//dummy req
const req = blankIdRequest;

//dummy resp
const res = blankResponse;

describe('getProjectSocials', () => {
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

    await getProjectSocialsController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1'; //resetting it for the next test
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getProjectSocialsService).mockResolvedValue('INTERNAL_ERROR');
    expect(getProjectSocialsService).toBe(vi.mocked(getProjectSocialsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getProjectSocialsController(req, res);
    expect(getProjectSocialsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //members could not be found, should return 404
  test('Must return 404 when the project could not be found', async () => {
    vi.mocked(getProjectSocialsService).mockResolvedValue('NOT_FOUND');
    expect(getProjectSocialsService).toBe(vi.mocked(getProjectSocialsService));
    const resBody = {
      status: 404,
      error: 'Project not found',
      data: null,
    };

    await getProjectSocialsController(req, res);
    expect(getProjectSocialsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
  //everything's good, return 200
  test('Must return 200 when the members were retrieved successfully', async () => {
    vi.mocked(getProjectSocialsService).mockResolvedValue([blankProjectSocial]);
    expect(getProjectSocialsService).toBe(vi.mocked(getProjectSocialsService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankProjectSocial],
    };

    await getProjectSocialsController(req, res);
    expect(getProjectSocialsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
