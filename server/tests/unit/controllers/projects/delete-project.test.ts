import type { Request, Response } from 'express';
import { describe, expect, test, vi } from 'vitest';
import deleteProjectController from '#controllers/projects/delete-project.ts';
import { deleteProjectService } from '#services/projects/delete-project.ts';

vi.mock('#services/projects/delete-project.ts');

//dummy req
const req = {
  params: {
    id: '1',
  },
} as unknown as Request;

//dummy resp
const res = {
  json: vi.fn(() => res),
  status: vi.fn(() => res),
} as unknown as Response;

describe('deleteProject', () => {
  //project has a non-numerical id, should return 400
  test('Must return 400 when project id is invalid', async () => {
    req.params.id = 'not a number either';
    const resBody = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };

    await deleteProjectController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(deleteProjectService).mockClear();
    req.params.id = '1'; //resetting it for the next test
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(deleteProjectService).mockResolvedValue('INTERNAL_ERROR');
    expect(deleteProjectService).toBe(vi.mocked(deleteProjectService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await deleteProjectController(req, res);
    expect(deleteProjectService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(deleteProjectService).mockClear();
  });

  //there's something wrong with the update project service, should return 500
  test('Must return 404 when the project could not be found', async () => {
    vi.mocked(deleteProjectService).mockResolvedValue('NOT_FOUND');
    expect(deleteProjectService).toBe(vi.mocked(deleteProjectService));
    const resBody = {
      status: 404,
      error: 'Project not found',
      data: null,
    };

    await deleteProjectController(req, res);
    expect(deleteProjectService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(deleteProjectService).mockClear();
  });
  //everything's good, return 200
  test('Must return 200 when the project was deleted successfully', async () => {
    vi.mocked(deleteProjectService).mockResolvedValue('NO_CONTENT');
    expect(deleteProjectService).toBe(vi.mocked(deleteProjectService));
    const resBody = {
      status: 200,
      error: null,
      data: null,
    };

    await deleteProjectController(req, res);
    expect(deleteProjectService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(deleteProjectService).mockClear();
  });
});
