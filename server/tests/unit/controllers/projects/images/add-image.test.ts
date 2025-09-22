import { describe, expect, test, vi } from 'vitest';
import addImageController from '#controllers/projects/images/add-image.ts';
import { uploadImageService } from '#services/images/upload-image.ts';
import addImageService from '#services/projects/images/add-image.ts';
import {
  blankFile,
  blankImageRequest,
  blankResponse,
  blankUploadImage,
} from '#tests/resources/blanks/extra.ts';
import { blankProjectImage } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/images/add-image.ts');
vi.mock('#services/images/upload-image.ts');

const req = blankImageRequest;
const res = blankResponse;
const file = blankFile;

describe('addImage', () => {
  //project has a non-numerical id, should return 400
  test('Must return 400 when alt text is missing', async () => {
    (req.body as { altText: string }).altText = '';
    const resBody = {
      status: 400,
      error: 'Missing alt text',
      data: null,
    };

    await addImageController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    //an annoying reset but it is what it is
    (
      req.body as {
        image: string;
        altText: string;
      }
    ).image = '';
    (
      req.body as {
        image: string;
        altText: string;
      }
    ).altText = 'sample text'; //resetting it for the next test
  });

  //project has a non-numerical id, should return 400
  test("Must return 404 when file couldn't be found", async () => {
    req.file = undefined;
    const resBody = {
      status: 404,
      error: 'Image file not found',
      data: null,
    };

    await addImageController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.file = file; //resetting it for the next test
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

    await addImageController(req, res);
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(uploadImageService).mockClear();
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

    await addImageController(req, res);
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(uploadImageService).mockClear();
  });

  //there's something wrong with the add image service, should return 500
  test('Must return 500 when the add image service errors', async () => {
    vi.mocked(addImageService).mockResolvedValue('INTERNAL_ERROR');
    vi.mocked(uploadImageService).mockResolvedValue(blankUploadImage);
    expect(addImageService).toBe(vi.mocked(addImageService));
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await addImageController(req, res);
    expect(addImageService).toHaveBeenCalledOnce();
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(addImageService).mockClear();
    vi.mocked(uploadImageService).mockClear();
  });

  //everything's good, return 200
  test('Must return 200 when the project is successfully updated', async () => {
    vi.mocked(addImageService).mockResolvedValue(blankProjectImage);
    vi.mocked(uploadImageService).mockResolvedValue(blankUploadImage);
    expect(addImageService).toBe(vi.mocked(addImageService));
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectImage,
    };

    await addImageController(req, res);
    expect(addImageService).toHaveBeenCalledOnce();
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(addImageService).mockClear();
    vi.mocked(uploadImageService).mockClear();
  });
});
