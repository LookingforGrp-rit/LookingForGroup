import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import deleteMediumsController from '#controllers/projects/mediums/delete-project-mediums.ts';
import { deleteMediumsService } from '#services/projects/mediums/delete-project-mediums.ts';
import { blankMediumsRequest, blankResponse } from '#tests/resources/blanks/extra.ts';

vi.mock('#services/projects/mediums/delete-project-mediums.ts');

//all of these consts should ideally be shoved into their own file
//dummy req
const req = blankMediumsRequest;

//dummy resp
const res = blankResponse;

describe('deleteMediums', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(deleteMediumsService).mockResolvedValue('INTERNAL_ERROR');
    expect(deleteMediumsService).toBe(vi.mocked(deleteMediumsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await deleteMediumsController(req, res);
    expect(deleteMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the mediums are successfully deleted', async () => {
    vi.mocked(deleteMediumsService).mockResolvedValue('NO_CONTENT');
    expect(deleteMediumsService).toBe(vi.mocked(deleteMediumsService));
    const resBody = {
      status: 200,
      error: null,
      data: null,
    };

    await deleteMediumsController(req, res);
    expect(deleteMediumsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
