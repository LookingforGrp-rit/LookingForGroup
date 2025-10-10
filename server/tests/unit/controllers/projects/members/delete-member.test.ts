import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import deleteMemberController from '#controllers/projects/members/delete-member.ts';
import { deleteMemberService } from '#services/projects/members/delete-member.ts';
import { blankMemberRequest, blankResponse } from '#tests/resources/blanks/extra.ts';

vi.mock('#services/projects/members/delete-member.ts');

//dummy req
const req = blankMemberRequest;

//dummy resp
const res = blankResponse;

describe('deleteMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  //the member could not be found, should return 404
  test('Must return 404 when the member could not be found', async () => {
    vi.mocked(deleteMemberService).mockResolvedValue('NOT_FOUND');
    expect(deleteMemberService).toBe(vi.mocked(deleteMemberService));
    const resBody = {
      status: 404,
      error: 'Member not found',
      data: null,
    };

    await deleteMemberController(req, res);
    expect(deleteMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(deleteMemberService).mockResolvedValue('INTERNAL_ERROR');
    expect(deleteMemberService).toBe(vi.mocked(deleteMemberService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await deleteMemberController(req, res);
    expect(deleteMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the member is successfully deleted', async () => {
    vi.mocked(deleteMemberService).mockResolvedValue('NO_CONTENT');
    expect(deleteMemberService).toBe(vi.mocked(deleteMemberService));
    const resBody = {
      status: 200,
      error: null,
      data: null,
    };

    await deleteMemberController(req, res);
    expect(deleteMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
