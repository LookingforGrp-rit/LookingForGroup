import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import getProjectTagsController from '#controllers/projects/tags/get-proj-tags.ts';
import getProjectTagsService from '#services/projects/tags/get-proj-tags.ts';
import { blankTagsRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectTag } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/tags/get-proj-tags.ts');

//dummy req
const req = blankTagsRequest;

//dummy resp
const res = blankResponse;

describe('getProjectTags', () => {
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

    await getProjectTagsController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1'; //resetting it for the next test
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getProjectTagsService).mockResolvedValue('INTERNAL_ERROR');
    expect(getProjectTagsService).toBe(vi.mocked(getProjectTagsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getProjectTagsController(req, res);
    expect(getProjectTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //project could not be found, return 404
  test('Must return 404 when the project could not be found', async () => {
    vi.mocked(getProjectTagsService).mockResolvedValue('NOT_FOUND');
    expect(getProjectTagsService).toBe(vi.mocked(getProjectTagsService));
    const resBody = {
      status: 404,
      error: 'Project not found',
      data: null,
    };

    await getProjectTagsController(req, res);
    expect(getProjectTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the tags were retrieved successfully', async () => {
    vi.mocked(getProjectTagsService).mockResolvedValue([blankProjectTag]);
    expect(getProjectTagsService).toBe(vi.mocked(getProjectTagsService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankProjectTag],
    };

    await getProjectTagsController(req, res);
    expect(getProjectTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
