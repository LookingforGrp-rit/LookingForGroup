import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import updateProjectController from '#controllers/projects/update-proj.ts';
import { uploadImageService } from '#services/images/upload-image.ts';
import updateProjectService from '#services/projects/update-proj.ts';
import { blankFile, blankProjectRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectDetail } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/update-proj.ts');
vi.mock('#services/images/upload-image.ts');

const req = blankProjectRequest;
const res = blankResponse;
const file = blankFile;

describe('updateProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //currentUser has a non-numerical id, should return 400
  test('Must return 400 when currentUser id is not a number', async () => {
    req.currentUser = 'nowhere NEAR a number';

    const resBody = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    await updateProjectController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.currentUser = '1'; //resetting it for the next test
  });

  //project has a non-numerical id, should return 400
  test('Must return 400 when project id is invalid', async () => {
    req.params.id = 'not a number either';
    const resBody = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };

    await updateProjectController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1'; //resetting it for the next test
  });
  //they added an image that's too big, should return 413
  test('Must return 413 when the user attempts to add a massive image', async () => {
    req.file = file; //the uploadImageService only runs when there's a file

    vi.mocked(uploadImageService).mockResolvedValue('CONTENT_TOO_LARGE');
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
    const resBody = {
      status: 413,
      error: 'Image too large',
      data: null,
    };

    await updateProjectController(req, res);
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //they added an image that had a problem somewhere, should return 500
  test('Must return 500 when the image service errors', async () => {
    req.file = file;

    vi.mocked(uploadImageService).mockResolvedValue('INTERNAL_ERROR');
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await updateProjectController(req, res);
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.file = undefined; //resetting it for the next test
  });

  //there's something wrong with the update project service, should return 500
  test('Must return 500 when the update project service errors', async () => {
    vi.mocked(updateProjectService).mockResolvedValue('INTERNAL_ERROR');
    expect(updateProjectService).toBe(vi.mocked(updateProjectService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await updateProjectController(req, res);
    expect(updateProjectService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project is successfully updated', async () => {
    vi.mocked(updateProjectService).mockResolvedValue(blankProjectDetail);
    expect(updateProjectService).toBe(vi.mocked(updateProjectService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectDetail,
    };

    await updateProjectController(req, res);
    expect(updateProjectService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
