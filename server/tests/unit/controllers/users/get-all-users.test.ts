import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getAllUsers } from '#controllers/users/get-all-users.ts';
import { getAllUsersService } from '#services/users/get-all-users.ts';
import { fullFilterRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankUserDetail } from '#tests/resources/blanks/users.ts';

vi.mock('#services/users/get-all-users.ts');

//dummy req
const req = fullFilterRequest;

//dummy resp
const res = blankResponse;
describe('getAllUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  //value provided for strictness is not 'any' or 'all', should return 400
  test('Must return 400 when strictness is invalid', async () => {
    req.query.strictness = 'neither';

    const resBody = {
      status: 400,
      error: 'Invalid strictness',
      data: null,
    };

    await getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //they provided strictness without filters, should return 400
  test('Must return 400 when strictness is provided without any filters', async () => {
    req.query.strictness = 'any';

    const resBody = {
      status: 400,
      error: 'Strictness provided without filters',
      data: null,
    };

    await getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //they provided filters without any strictness, should return 400
  test('Must return 400 when filters are provided without any strictness', async () => {
    req.query.strictness = undefined;
    req.query.mentor = 'false';

    const resBody = {
      status: 400,
      error: 'No strictness provided for filters',
      data: null,
    };

    await getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(getAllUsersService).mockResolvedValue('INTERNAL_ERROR');
    expect(getAllUsersService).toBe(vi.mocked(getAllUsersService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await getAllUsers(req, res);
    expect(getAllUsersService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the users were retrieved successfully', async () => {
    vi.mocked(getAllUsersService).mockResolvedValue([blankUserDetail]);
    expect(getAllUsersService).toBe(vi.mocked(getAllUsersService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankUserDetail],
    };

    await getAllUsers(req, res);
    expect(getAllUsersService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
