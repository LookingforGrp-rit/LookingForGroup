import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import removeImageController from '#controllers/projects/images/remove-image.ts';
import getProjectByIdService from '#services/projects/get-proj-id.ts';
import { removeImageService } from '#services/projects/images/remove-image.ts';
import { blankIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectWithFollowers } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/images/remove-image.ts');
vi.mock('#services/projects/get-project-id.ts');

const req = blankIdRequest;
const res = blankResponse;

describe('removeImage', () => {
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
      error: 'Invalid project or image ID',
      data: null,
    };

    await removeImageController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1';
  });

  //image has a non-numerical id, should return 400
  test('Must return 400 when the image id is invalid', async () => {
    req.params.picId = 'nowhere NEAR a number';
    const resBody = {
      status: 400,
      error: 'Invalid project or image ID',
      data: null,
    };

    await removeImageController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.picId = '1';
  });

  //project couldn't be found, return 404
  test("Must return 404 when the project couldn't be found", async () => {
    vi.mocked(getProjectByIdService).mockResolvedValue('NOT_FOUND');
    expect(getProjectByIdService).toBe(vi.mocked(getProjectByIdService));
    const resBody = {
      status: 404,
      error: 'Project not found',
      data: null,
    };

    await removeImageController(req, res);
    expect(getProjectByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //image couldn't be found, return 404
  test("Must return 404 when the image couldn't be found", async () => {
    vi.mocked(removeImageService).mockResolvedValue('NOT_FOUND');
    vi.mocked(getProjectByIdService).mockResolvedValue(blankProjectWithFollowers);
    expect(getProjectByIdService).toBe(vi.mocked(getProjectByIdService));
    expect(removeImageService).toBe(vi.mocked(removeImageService));
    const resBody = {
      status: 404,
      error: 'Image not found',
      data: null,
    };

    await removeImageController(req, res);
    expect(removeImageService).toHaveBeenCalledOnce();
    expect(getProjectByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(removeImageService).mockResolvedValue('INTERNAL_ERROR');
    vi.mocked(getProjectByIdService).mockResolvedValue(blankProjectWithFollowers);
    expect(getProjectByIdService).toBe(vi.mocked(getProjectByIdService));
    expect(removeImageService).toBe(vi.mocked(removeImageService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await removeImageController(req, res);
    expect(removeImageService).toHaveBeenCalledOnce();
    expect(getProjectByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(removeImageService).mockResolvedValue('NO_CONTENT');
    vi.mocked(getProjectByIdService).mockResolvedValue(blankProjectWithFollowers);
    expect(getProjectByIdService).toBe(vi.mocked(getProjectByIdService));
    expect(removeImageService).toBe(vi.mocked(removeImageService));
    const resBody = {
      status: 200,
      error: null,
      data: 'NO_CONTENT',
    };

    await removeImageController(req, res);
    expect(removeImageService).toHaveBeenCalledOnce();
    expect(getProjectByIdService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
