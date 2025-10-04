import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import getProjectImagesController from '#controllers/projects/images/get-project-images.ts';
import getProjectImagesService from '#services/projects/images/get-proj-images.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectImage } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/images/get-project-images.ts');

const blankImageList = [blankProjectImage];
const req = blankIdRequest;
const res = blankResponse;

describe('getProjectImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //project has a non-numerical id, should return 400
  test('Must return 400 when the project id is invalid', async () => {
    req.params.id = 'nowhere NEAR a number';
    const resBody = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };

    await getProjectImagesController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1';
  });
  //project has a non-numerical id, should return 400
  test("Must return 404 when the project couldn't be found", async () => {
    vi.mocked(getProjectImagesService).mockResolvedValue('NOT_FOUND');
    expect(getProjectImagesService).toBe(vi.mocked(getProjectImagesService));
    const resBody = {
      status: 404,
      error: 'Project not found',
      data: null,
    };

    await getProjectImagesController(req, res);
    expect(getProjectImagesService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getProjectImagesService).mockResolvedValue('INTERNAL_ERROR');
    expect(getProjectImagesService).toBe(vi.mocked(getProjectImagesService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getProjectImagesController(req, res);
    expect(getProjectImagesService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the images were retrieved successfully', async () => {
    vi.mocked(getProjectImagesService).mockResolvedValue(blankImageList);
    expect(getProjectImagesService).toBe(vi.mocked(getProjectImagesService));
    const resBody = {
      status: 200,
      error: null,
      data: blankImageList,
    };

    await getProjectImagesController(req, res);
    expect(getProjectImagesService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
