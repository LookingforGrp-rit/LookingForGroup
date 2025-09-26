import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import getProjectsController from '#controllers/projects/get-projects.ts';
import getProjectsService from '#services/projects/get-projects.ts';
import { blankRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectPreview } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/get-projects.ts');

//dummy req
const req = blankRequest;

//dummy resp
const res = blankResponse;
describe('getProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getProjectsService).mockResolvedValue('INTERNAL_ERROR');
    expect(getProjectsService).toBe(vi.mocked(getProjectsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getProjectsController(req, res);
    expect(getProjectsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getProjectsService).mockResolvedValue([blankProjectPreview]);
    expect(getProjectsService).toBe(vi.mocked(getProjectsService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankProjectPreview],
    };

    await getProjectsController(req, res);
    expect(getProjectsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
