import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import addTagsController from '#controllers/projects/tags/add-tags.ts';
import addTagsService from '#services/projects/tags/add-tags.ts';
import { blankTagsRequest, blankResponse } from '#tests/resources/blanks/extra.ts';
import { blankProjectTag } from '#tests/resources/blanks/projects.ts';

vi.mock('#services/projects/tags/add-tags.ts');

//dummy req
const req = blankTagsRequest;

//dummy resp
const res = blankResponse;

describe('addTags', () => {
  beforeEach(() => {
    vi.mocked(addTagsService).mockClear();
  });
  afterEach(() => {
    vi.mocked(addTagsService).mockClear();
  });

  //one of the tags doesn't exist, should return 404
  test('Must return 404 when one of the tags could not be found', async () => {
    vi.mocked(addTagsService).mockResolvedValue('NOT_FOUND');
    expect(addTagsService).toBe(vi.mocked(addTagsService));
    const resBody = {
      status: 404,
      error: 'Tags not found',
      data: null,
    };

    await addTagsController(req, res);
    expect(addTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //there's something wrong with the service, should return 500
  test('Must return 500 when the service errors', async () => {
    vi.mocked(addTagsService).mockResolvedValue('INTERNAL_ERROR');
    expect(addTagsService).toBe(vi.mocked(addTagsService));
    const resBody = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    await addTagsController(req, res);
    expect(addTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });

  //everything's good, return 200
  test('Must return 200 when the tags are successfully added', async () => {
    vi.mocked(addTagsService).mockResolvedValue([blankProjectTag]);
    expect(addTagsService).toBe(vi.mocked(addTagsService));
    const resBody = {
      status: 200,
      error: null,
      data: [blankProjectTag],
    };

    await addTagsController(req, res);
    expect(addTagsService).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resBody);
  });
});
