import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the service
vi.mock('#services/projects/delete-member.ts', () => ({
  deleteMemberService: vi.fn(),
}));

import deleteMemberController from '#controllers/projects/delete-member.ts';
import { deleteMemberService } from '#services/projects/delete-member.ts';
const mockDeleteMemberService = deleteMemberService as any;

// Mock request and response objects
const createMockRequest = (params = {}) => ({
  params,
});

const createMockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

describe('deleteMemberController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully delete a project member', async () => {
    const req = createMockRequest({
      id: '1',
      userId: '2',
    });
    const res = createMockResponse();

    mockDeleteMemberService.mockResolvedValue('NO_CONTENT');

    await deleteMemberController(req as any, res as any);

    expect(mockDeleteMemberService).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      error: null,
      data: null,
    });
  });

  it('should return 400 for invalid project ID', async () => {
    const req = createMockRequest({
      id: 'invalid',
      userId: '2',
    });
    const res = createMockResponse();

    await deleteMemberController(req as any, res as any);

    expect(mockDeleteMemberService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      error: 'Invalid project or member id',
      data: null,
    });
  });

  it('should return 400 for invalid member ID', async () => {
    const req = createMockRequest({
      id: '1',
      userId: 'invalid',
    });
    const res = createMockResponse();

    await deleteMemberController(req as any, res as any);

    expect(mockDeleteMemberService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      error: 'Invalid project or member id',
      data: null,
    });
  });

  it('should return 404 when member not found', async () => {
    const req = createMockRequest({
      id: '1',
      userId: '2',
    });
    const res = createMockResponse();

    mockDeleteMemberService.mockResolvedValue('NOT_FOUND');

    await deleteMemberController(req as any, res as any);

    expect(mockDeleteMemberService).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      error: 'Member not found',
      data: null,
    });
  });

  it('should return 500 for internal server error', async () => {
    const req = createMockRequest({
      id: '1',
      userId: '2',
    });
    const res = createMockResponse();

    mockDeleteMemberService.mockResolvedValue('INTERNAL_ERROR');

    await deleteMemberController(req as any, res as any);

    expect(mockDeleteMemberService).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      error: 'Internal Server Error',
      data: null,
    });
  });
});