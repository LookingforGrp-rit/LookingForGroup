import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import addMemberController from '#controllers/projects/members/add-member.ts';
import addMemberService from '#services/projects/members/add-member.ts';
import { blankMemberRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectMember } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/members/add-member.ts');

//dummy req
const req = blankMemberRequest;

//dummy resp
const res = blankResponse;

describe('addMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //project has a non-numerical id, should return 400
  test('Must return 400 when project id is invalid', async () => {
    req.params.id = 'not a number either';
    const resBody = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };

    await addMemberController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);

    req.params.id = '1'; //resetting it for the next test
  });

  //the user or the role doesn't exist, should return 404
  test('Must return 404 when the user or role could not be found', async () => {
    vi.mocked(addMemberService).mockResolvedValue('NOT_FOUND');
    expect(addMemberService).toBe(vi.mocked(addMemberService));
    const resBody = {
      status: 404,
      error: 'User or role not found',
      data: null,
    };

    await addMemberController(req, res);
    expect(addMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //the user is already a member, should return 404
  test('Must return 409 when the user is already a member of the project', async () => {
    vi.mocked(addMemberService).mockResolvedValue('CONFLICT');
    expect(addMemberService).toBe(vi.mocked(addMemberService));
    const resBody = {
      status: 409,
      error: 'User already a member of project',
      data: null,
    };

    await addMemberController(req, res);
    expect(addMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(addMemberService).mockResolvedValue('INTERNAL_ERROR');
    expect(addMemberService).toBe(vi.mocked(addMemberService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await addMemberController(req, res);
    expect(addMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the member is successfully created', async () => {
    vi.mocked(addMemberService).mockResolvedValue(blankProjectMember);
    expect(addMemberService).toBe(vi.mocked(addMemberService));
    const resBody = {
      status: 200,
      error: null,
      data: blankProjectMember,
    };

    await addMemberController(req, res);
    expect(addMemberService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
