import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import deleteTagsController from '#controllers/projects/tags/delete-tags.ts';
import { deleteTagsService } from '#services/projects/tags/delete-tags.ts';
import { blankTagsRequest, blankResponse } from '#tests/resources/blanks/extra.ts';

vi.mock('#services/projects/tags/delete-tags.ts');

//all of these consts should ideally be shoved into their own file
//dummy req
const req = blankTagsRequest;

//dummy resp
const res = blankResponse;

describe('deleteTags', () => {
  beforeEach(() => {
    vi.mocked(deleteTagsService).mockClear();
  });
  afterEach(() => {
    vi.mocked(deleteTagsService).mockClear();
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(deleteTagsService).mockResolvedValue('INTERNAL_ERROR');
    expect(deleteTagsService).toBe(vi.mocked(deleteTagsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await deleteTagsController(req, res);
    expect(deleteTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the tags are successfully deleted', async () => {
    vi.mocked(deleteTagsService).mockResolvedValue('NO_CONTENT');
    expect(deleteTagsService).toBe(vi.mocked(deleteTagsService));
    const resBody = {
      status: 200,
      error: null,
      data: null,
    };

    await deleteTagsController(req, res);
    expect(deleteTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
