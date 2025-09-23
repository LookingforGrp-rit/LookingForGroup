import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import updateMemberController from '#controllers/projects/members/update-member.ts';
import updateMemberService from '#services/projects/members/update-member.ts';
import { blankMemberRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectMember } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/members/update-member.ts');
vi.mock('#services/images/upload-image.ts');

const req = blankMemberRequest;
const res = blankResponse;

describe('updateMember', () => {
  beforeEach(() => {
    vi.mocked(updateMemberService).mockClear();
  });
  afterEach(() => {
    vi.mocked(updateMemberService).mockClear();
  });

  //currentUser has a non-numerical id, should return 400
  test('Must return 400 when currentUser id is not a number', async () => {
    req.params.userId = 'nowhere NEAR a number';

    const resBody = {
      status: 400,
      error: 'Invalid user or project ID',
      data: null,
    };
    await updateMemberController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.userId = '1'; //resetting it for the next test
  });

  //project has a non-numerical id, should return 400
  test('Must return 400 when project id is invalid', async () => {
    req.params.id = 'not a number either';
    const resBody = {
      status: 400,
      error: 'Invalid user or project ID',
      data: null,
    };

    await updateMemberController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1'; //resetting it for the next test
  });

  //the member could not be found, should return 404
  test('Must return 404 when the member could not be found', async () => {
    vi.mocked(updateMemberService).mockResolvedValue('NOT_FOUND');
    expect(updateMemberService).toBe(vi.mocked(updateMemberService));
    const resBody = {
      status: 404,
      error: 'Member not found',
      data: null,
    };

    await updateMemberController(req, res);
    expect(updateMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the update member service, should return 500
  test('Must return 500 when the update member service errors', async () => {
    vi.mocked(updateMemberService).mockResolvedValue('INTERNAL_ERROR');
    expect(updateMemberService).toBe(vi.mocked(updateMemberService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await updateMemberController(req, res);
    expect(updateMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the project is successfully updated', async () => {
    vi.mocked(updateMemberService).mockResolvedValue(blankProjectMember);
    expect(updateMemberService).toBe(vi.mocked(updateMemberService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectMember,
    };

    await updateMemberController(req, res);
    expect(updateMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
