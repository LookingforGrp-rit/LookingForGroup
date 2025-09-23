import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import addMediumsController from '#controllers/projects/mediums/add-project-mediums.ts';
import addMediumsService from '#services/projects/mediums/add-project-mediums.ts';
import { blankMediumsRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectMedium } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/mediums/add-project-mediums.ts');

//dummy req
const req = blankMediumsRequest;

//dummy resp
const res = blankResponse;

describe('addMediums', () => {
  beforeEach(() => {
    vi.mocked(addMediumsService).mockClear();
  });
  afterEach(() => {
    vi.mocked(addMediumsService).mockClear();
  });

  //one of the mediums doesn't exist, should return 404
  test('Must return 404 when one of the mediums could not be found', async () => {
    vi.mocked(addMediumsService).mockResolvedValue('NOT_FOUND');
    expect(addMediumsService).toBe(vi.mocked(addMediumsService));
    const resBody = {
      status: 404,
      error: 'Medium not found',
      data: null,
    };

    await addMediumsController(req, res);
    expect(addMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(addMediumsService).mockResolvedValue('INTERNAL_ERROR');
    expect(addMediumsService).toBe(vi.mocked(addMediumsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await addMediumsController(req, res);
    expect(addMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project is successfully created', async () => {
    vi.mocked(addMediumsService).mockResolvedValue([blankProjectMedium]);
    expect(addMediumsService).toBe(vi.mocked(addMediumsService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankProjectMedium],
    };

    await addMediumsController(req, res);
    expect(addMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
