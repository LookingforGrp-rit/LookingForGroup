import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { deleteUser } from '#controllers/me/delete-user.ts';
import { deleteUserService } from '#services/me/delete-user.ts';
import { blankAuthIdRequest, blankResponse } from '#tests/resources/blanks/extra.ts';

vi.mock('#services/me/delete-user.ts');

const req = blankAuthIdRequest;
const res = blankResponse;

describe('deleteUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(deleteUserService).mockResolvedValue('INTERNAL_ERROR');
    expect(deleteUserService).toBe(vi.mocked(deleteUserService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await deleteUser(req, res);
    expect(deleteUserService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //the user could not be found, should return 400
  test('Must return 404 when the user could not be found', async () => {
    vi.mocked(deleteUserService).mockResolvedValue('NOT_FOUND');
    expect(deleteUserService).toBe(vi.mocked(deleteUserService));
    const resBody = {
      status: 404,
      error: 'User not found',
      data: null,
    };

    await deleteUser(req, res);
    expect(deleteUserService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
  //everything's good, return 200
  test('Must return 200 when the user was deleted successfully', async () => {
    vi.mocked(deleteUserService).mockResolvedValue('NO_CONTENT');
    expect(deleteUserService).toBe(vi.mocked(deleteUserService));
    const resBody = {
      status: 200,
      error: null,
      data: null,
    };

    await deleteUser(req, res);
    expect(deleteUserService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
