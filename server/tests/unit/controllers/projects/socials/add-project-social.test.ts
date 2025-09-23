import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import addProjectSocialController from '#controllers/projects/socials/add-project-social.ts';
import { addProjectSocialService } from '#services/projects/socials/add-project-social.ts';
import { blankSocialRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectSocial } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/socials/add-project-social.ts');

//dummy req
const req = blankSocialRequest;

//dummy resp
const res = blankResponse;

describe('addProjectSocial', () => {
  beforeEach(() => {
    vi.mocked(addProjectSocialService).mockClear();
  });
  afterEach(() => {
    vi.mocked(addProjectSocialService).mockClear();
  });

  //the social id was invalid, should return 404
  test("Must return 404 when the socialId doesn't correspond to an existing social", async () => {
    vi.mocked(addProjectSocialService).mockResolvedValue('NOT_FOUND');
    expect(addProjectSocialService).toBe(vi.mocked(addProjectSocialService));
    const resBody = {
      status: 404,
      error: 'Social at provided ID does not exist',
      data: null,
    };

    await addProjectSocialController(req, res);
    expect(addProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //the project already has a social from this site, should return 409
  test('Must return 409 when the project already has a social from this site', async () => {
    vi.mocked(addProjectSocialService).mockResolvedValue('CONFLICT');
    expect(addProjectSocialService).toBe(vi.mocked(addProjectSocialService));
    const resBody = {
      status: 409,
      error: 'You already have a social from this site',
      data: null,
    };

    await addProjectSocialController(req, res);
    expect(addProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(addProjectSocialService).mockResolvedValue('INTERNAL_ERROR');
    expect(addProjectSocialService).toBe(vi.mocked(addProjectSocialService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await addProjectSocialController(req, res);
    expect(addProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 201
  test('Must return 201 when the social is successfully created', async () => {
    vi.mocked(addProjectSocialService).mockResolvedValue(blankProjectSocial);
    expect(addProjectSocialService).toBe(vi.mocked(addProjectSocialService));
    const resBody = {
      status: 201,
      error: null,
      data: blankProjectSocial,
    };

    await addProjectSocialController(req, res);
    expect(addProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
