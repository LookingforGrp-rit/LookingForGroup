import type { Readable } from 'stream';
import type { ProjectDetail } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { describe, expect, test, vi } from 'vitest';
import {
  uidHeaderKey,
  firstNameHeaderKey,
  lastNameHeaderKey,
  emailHeaderKey,
} from '#config/constants.ts';
import createProjectController from '#controllers/projects/create-project.ts';
import { uploadImageService } from '#services/images/upload-image.ts';
import createProjectService from '#services/projects/create-proj.ts';

vi.mock('#config/prisma.ts');
vi.mock('#services/projects/create-proj.ts');
vi.mock('#services/images/upload-image.ts');

//all of these consts would ideally be shoved into their own file
const req = {
  headers: {
    [uidHeaderKey]: '000000001',
    [firstNameHeaderKey]: 'firstname',
    [lastNameHeaderKey]: 'lastname',
    [emailHeaderKey]: 'email@rit.edu',
  },
  query: {
    devId: '1',
  },
  body: {
    title: "James Testguy's Great Game",
    hook: "James Testguy's Great Hook",
    description: 'The first game ever created by James Testguy',
    status: 'Planning',
  },
} as unknown as Request;

const res = {} as unknown as Response;
res.json = vi.fn(() => res);
res.status = vi.fn(() => res);

const project = {
  title: "James Testguy's Great Game",
  hook: "James Testguy's Great Hook",
  description: 'The first game ever created by James Testguy',
  status: 'Planning',
} as ProjectDetail;

//for images
const file = {
  fieldname: 'test name',
  originalname: 'test og',
  encoding: 'idk something',
  mimetype: 'json',
  size: 82,
  stream: {} as unknown as Readable,
  destination: 'nowhere',
  filename: 'blankImg',
  path: 'road/to/nowhere',
  buffer: {} as unknown as Buffer,
};

describe('createProject', () => {
  //currentUser is undefined, should return 400
  test('Must return 400 with invalid currentUser', async () => {
    const resBody = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    req.currentUser = undefined;

    await createProjectController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //currentUser has a non-numerical id, should return 400
  test('Must return 400 with invalid user ID for current user', async () => {
    req.currentUser = 'nowhere NEAR a number';
    const resBody = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    await createProjectController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //they added an image that's too big, should return 413
  test('Must return 413 when the user attempts to add a massive image', async () => {
    req.currentUser = '1';
    const resBody = {
      status: 413,
      error: 'Image too large',
      data: null,
    };
    req.file = file; //the uploadImageService only runs when there's a file
    vi.mocked(uploadImageService).mockResolvedValue('CONTENT_TOO_LARGE');
    expect(uploadImageService).toBe(vi.mocked(uploadImageService));

    await createProjectController(req, res);
    expect(uploadImageService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(uploadImageService).mockClear();
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

    vi.mocked(uploadImageService).mockClear();
  });

  //there's something wrong with the create project service, should return 500
  test('Must return 500 when the create project service errors', async () => {
    req.file = undefined;
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

    vi.mocked(createProjectService).mockClear();
  });

  //everything's good, return 200
  test('Must return 200 when the project is successfully created', async () => {
    vi.mocked(createProjectService).mockResolvedValue(project);
    expect(createProjectService).toBe(vi.mocked(createProjectService));
    const resBody = {
      status: 200,
      error: null,
      data: project,
    };

    await createProjectController(req, res);
    expect(createProjectService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(createProjectService).mockClear();
  });
});
