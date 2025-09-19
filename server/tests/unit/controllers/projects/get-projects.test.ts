import type { Request, Response } from 'express';
import { describe, expect, test, vi } from 'vitest';
import getProjectsController from '#controllers/projects/get-projects.ts';
import getProjectsService from '#services/projects/get-projects.ts';
import { blankProjectPreview } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/get-proj-id.ts');

const blankProjectList = [blankProjectPreview];

//dummy req
const req = {
  body: {
    title: "James Testguy's Great Game",
    hook: "James Testguy's Great Hook",
    description: 'The first game ever created by James Testguy',
    status: 'Planning',
  },
} as unknown as Request;

//dummy resp
const res = {
  json: vi.fn(() => res),
  status: vi.fn(() => res),
} as unknown as Response;

describe('getProjects', () => {
  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getProjectsService).mockResolvedValue('INTERNAL_ERROR');
    expect(getProjectsService).toBe(vi.mocked(getProjectsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getProjectsController(req, res);
    expect(getProjectsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(getProjectsService).mockClear();
  });

  //everything's good, return 200
  test('Must return 200 when the project was retrieved successfully', async () => {
    vi.mocked(getProjectsService).mockResolvedValue(blankProjectList);
    expect(getProjectsService).toBe(vi.mocked(getProjectsService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectList,
    };

    await getProjectsController(req, res);
    expect(getProjectsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);

    vi.mocked(getProjectsService).mockClear();
  });
});
