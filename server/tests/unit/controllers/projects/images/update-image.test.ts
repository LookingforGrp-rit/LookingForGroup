import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import updateImageController from '#controllers/projects/images/update-image.ts';
import { uploadImageService } from '#services/images/upload-image.ts';
import updateImageService from '#services/projects/images/update-image.ts';
import {
  blankFile,
  blankImageRequest,
  blankResponse,
  blankUploadImage,
} from '#tests/resources/blanks/extra.ts';
import { blankProjectImage } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/images/update-image.ts');
vi.mock('#services/images/upload-image.ts');

const req = blankImageRequest;
const res = blankResponse;
const file = blankFile;

describe('updateImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //project has a non-numerical id, should return 400
  test('Must return 400 when the image id is invalid', async () => {
    req.params.imageId = 'nowhere near a number';
    const resBody = {
      status: 400,
      error: 'Invalid image ID',
      data: null,
    };

    await updateImageController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.imageId = '1'; //resetting it for the next test
  });

  //project has a non-numerical id, should return 400
  test('Must return 400 when an invalid field is provided', async () => {
    (
      req.body as {
        image: string;
        altText: string;
        addedParam: string;
      }
    ).addedParam = 'this should not be here';
    req.file = file;
    const resBody = {
      status: 400,
      error: 'Invalid fields: ["addedParam"]',
      data: null,
    };

    await updateImageController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.body = {
      image: '',
      altText: 'sample text',
    };
  });

  //they added an image that's too big, should return 413
  test('Must return 413 when the user attempts to add a massive image', async () => {
    vi.mocked(uploadImageService).mockResolvedValue('CONTENT_TOO_LARGE');
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
    const resBody = {
      status: 413,
      error: 'Image too large',
      data: null,
    };

    await updateImageController(req, res);
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //they added an image that had a problem somewhere, should return 500
  test('Must return 500 when the upload image service errors', async () => {
    vi.mocked(uploadImageService).mockResolvedValue('INTERNAL_ERROR');
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await updateImageController(req, res);
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //image to update not found, should return 404
  test("Must return 404 when image to update couldn't be found", async () => {
    vi.mocked(uploadImageService).mockResolvedValue(blankUploadImage);
    vi.mocked(updateImageService).mockResolvedValue('NOT_FOUND');
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
    expect(updateImageService).toBe(vi.mocked(updateImageService));
    const resBody = {
      status: 404,
      error: 'Image not found',
      data: null,
    };

    await updateImageController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the update image service, should return 500
  test('Must return 500 when the update image service errors', async () => {
    vi.mocked(updateImageService).mockResolvedValue('INTERNAL_ERROR');
    vi.mocked(uploadImageService).mockResolvedValue(blankUploadImage);
    expect(updateImageService).toBe(vi.mocked(updateImageService));
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await updateImageController(req, res);
    expect(updateImageService).toHaveBeenCalledOnce();
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project is successfully updated', async () => {
    vi.mocked(updateImageService).mockResolvedValue(blankProjectImage);
    vi.mocked(uploadImageService).mockResolvedValue(blankUploadImage);
    expect(updateImageService).toBe(vi.mocked(updateImageService));
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectImage,
    };

    await updateImageController(req, res);
    expect(updateImageService).toHaveBeenCalledOnce();
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
