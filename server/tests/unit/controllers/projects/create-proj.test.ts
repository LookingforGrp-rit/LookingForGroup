import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import createProjectController from '#controllers/projects/create-proj.ts';
import { uploadImageService } from '#services/images/upload-image.ts';
import createProjectService from '#services/projects/create-proj.ts';
import { blankFile, blankProjectRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectDetail } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/create-project.ts');
vi.mock('#services/images/upload-image.ts');

//all of these consts should ideally be shoved into their own file
//dummy req
const req = blankProjectRequest;

//dummy resp
const res = blankResponse;

//dummy image file
const file = blankFile;

describe('createProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  //currentUser has a non-numerical id, should return 400
  test('Must return 400 when currentUser is invalid', async () => {
    req.currentUser = 'nowhere NEAR a number';

    const resBody = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    await createProjectController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.currentUser = '1'; //resetting it for the next test
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

    await createProjectController(req, res);
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

    await createProjectController(req, res);
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.file = undefined; //resetting it for the next test
  });

  //there's something wrong with the create project service, should return 500
  test('Must return 500 when the create project service errors', async () => {
    vi.mocked(createProjectService).mockResolvedValue('INTERNAL_ERROR');
    expect(createProjectService).toBe(vi.mocked(createProjectService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await createProjectController(req, res);
    expect(createProjectService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project is successfully created', async () => {
    vi.mocked(createProjectService).mockResolvedValue(blankProjectDetail);
    expect(createProjectService).toBe(vi.mocked(createProjectService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectDetail,
    };

    await createProjectController(req, res);
    expect(createProjectService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
