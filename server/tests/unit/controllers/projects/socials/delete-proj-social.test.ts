import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { deleteProjectSocial } from '#controllers/projects/socials/delete-project-social.ts';
import { deleteProjectSocialService } from '#services/projects/socials/delete-proj-social.ts';
import { blankSocialRequest, blankResponse } from '#tests/resources/blanks/extra.ts';

vi.mock('#services/projects/socials/delete-project-social.ts');

//all of these consts should ideally be shoved into their own file
//dummy req
const req = blankSocialRequest;

//dummy resp
const res = blankResponse;

describe('deleteProjectSocial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(deleteProjectSocialService).mockResolvedValue('INTERNAL_ERROR');
    expect(deleteProjectSocialService).toBe(vi.mocked(deleteProjectSocialService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await deleteProjectSocial(req, res);
    expect(deleteProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //the member could not be found, should return 404
  test('Must return 404 when the member could not be found', async () => {
    vi.mocked(deleteProjectSocialService).mockResolvedValue('NOT_FOUND');
    expect(deleteProjectSocialService).toBe(vi.mocked(deleteProjectSocialService));
    const resBody = {
      status: 404,
      error: 'Social not found',
      data: null,
    };

    await deleteProjectSocial(req, res);
    expect(deleteProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project is successfully created', async () => {
    vi.mocked(deleteProjectSocialService).mockResolvedValue('NO_CONTENT');
    expect(deleteProjectSocialService).toBe(vi.mocked(deleteProjectSocialService));
    const resBody = {
      status: 200,
      error: null,
      data: null,
    };

    await deleteProjectSocial(req, res);
    expect(deleteProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
