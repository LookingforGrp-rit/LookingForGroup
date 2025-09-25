import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getAllUsers } from '#controllers/users/get-all-users.ts';
import { getAllUsersService } from '#services/users/get-all-users.ts';
import { blankRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankUserDetail } from '#tests/resources/blanks/users.ts';

vi.mock('#services/users/get-all-users.ts');

//dummy req
const req = blankRequest;

//dummy resp
const res = blankResponse;
describe('getAllUsers', () => {
  beforeEach(() => {
    vi.mocked(getAllUsersService).mockClear();
  });
  afterEach(() => {
    vi.mocked(getAllUsersService).mockClear();
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
