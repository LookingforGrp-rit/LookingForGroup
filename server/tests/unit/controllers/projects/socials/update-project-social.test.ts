import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { updateProjectSocial } from '#controllers/projects/socials/update-project-social.ts';
import { updateProjectSocialService } from '#services/projects/socials/update-project-social.ts';
import { blankSocialRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectSocial } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/socials/update-project-social.ts');
vi.mock('#services/images/upload-image.ts');

const req = blankSocialRequest;
const res = blankResponse;

describe('updateProjectSocial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //the project could not be found, should return 404
  test('Must return 404 when the project social could not be found', async () => {
    vi.mocked(updateProjectSocialService).mockResolvedValue('NOT_FOUND');
    expect(updateProjectSocialService).toBe(vi.mocked(updateProjectSocialService));
    const resBody = {
      status: 404,
      error: 'Social not found',
      data: null,
    };

    await updateProjectSocial(req, res);
    expect(updateProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(updateProjectSocialService).mockResolvedValue('INTERNAL_ERROR');
    expect(updateProjectSocialService).toBe(vi.mocked(updateProjectSocialService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await updateProjectSocial(req, res);
    expect(updateProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project is successfully updated', async () => {
    vi.mocked(updateProjectSocialService).mockResolvedValue(blankProjectSocial);
    expect(updateProjectSocialService).toBe(vi.mocked(updateProjectSocialService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectSocial,
    };

    await updateProjectSocial(req, res);
    expect(updateProjectSocialService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
