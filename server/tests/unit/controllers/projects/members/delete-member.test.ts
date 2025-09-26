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
    vi.mocked(deleteMemberService).mockClear();
  });
  afterEach(() => {
    vi.mocked(deleteMemberService).mockClear();
  });
  //project has a non-numerical id, should return 400
  test('Must return 400 when project id is invalid', async () => {
    req.params.id = 'not a number either';
    const resBody = {
      status: 400,
      error: 'Invalid project or member id',
      data: null,
    };

    await deleteMemberController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1'; //resetting it for the next test
  });
  //the member could not be found, should return 404
  //FIXME update delete member test(s) to reflect new functionality.
  //Sebastian wrote a test but it has a lot of linting errors so probably
  //a cross between that one and this one is good.
  test("Must return 403 when the uer doesn't have permission to delete this member", async () => {
    vi.mocked(deleteMemberService).mockResolvedValue('FORBIDDEN');
    expect(deleteMemberService).toBe(vi.mocked(deleteMemberService));
    const resBody = {
      status: 403,
      error: 'Insufficient permissions',
      data: null,
    };

    await deleteMemberController(req, res);
    expect(deleteMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(resBody);
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
