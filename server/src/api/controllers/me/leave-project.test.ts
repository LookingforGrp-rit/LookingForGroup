import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the service
vi.mock('#services/me/leave-project.ts', () => ({
  leaveProjectService: vi.fn(),
}));

import { leaveProjectController } from '#controllers/me/leave-project.ts';
import { leaveProjectService } from '#services/me/leave-project.ts';
const mockLeaveProjectService = leaveProjectService as any;

// Mock request and response objects
const createMockRequest = (params = {}, body = {}, currentUser = '1') => ({
  params,
  body,
  currentUser,
});

const createMockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

describe('leaveProjectController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully handle user leaving a project', async () => {
    const req = createMockRequest(
      { id: '1' },
      { visibility: 'private' },
      '2'
    );
    const res = createMockResponse();

    mockLeaveProjectService.mockResolvedValue('NO_CONTENT');

    await leaveProjectController(req as any, res as any);

    expect(mockLeaveProjectService).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      error: null,
      data: { message: 'Successfully left the project' },
    });
  });

  it('should return 400 for invalid project ID', async () => {
    const req = createMockRequest(
      { id: 'invalid' },
      { visibility: 'private' },
      '2'
    );
    const res = createMockResponse();

    await leaveProjectController(req as any, res as any);

    expect(mockLeaveProjectService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      error: 'Invalid project ID',
      data: null,
    });
  });

  it('should return 400 for invalid user ID', async () => {
    const req = createMockRequest(
      { id: '1' },
      { visibility: 'private' },
      'invalid'
    );
    const res = createMockResponse();

    await leaveProjectController(req as any, res as any);

    expect(mockLeaveProjectService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      error: 'Invalid user ID',
      data: null,
    });
  });

  it('should return 400 for missing visibility in request body', async () => {
    const req = createMockRequest(
      { id: '1' },
      {},
      '2'
    );
    const res = createMockResponse();

    await leaveProjectController(req as any, res as any);

    expect(mockLeaveProjectService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      error: 'Invalid request. Set visibility to "private" to leave the project',
      data: null,
    });
  });

  it('should return 400 for invalid visibility value', async () => {
    const req = createMockRequest(
      { id: '1' },
      { visibility: 'public' },
      '2'
    );
    const res = createMockResponse();

    await leaveProjectController(req as any, res as any);

    expect(mockLeaveProjectService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      error: 'Invalid request. Set visibility to "private" to leave the project',
      data: null,
    });
  });

  it('should return 404 when project not found or user not a member', async () => {
    const req = createMockRequest(
      { id: '1' },
      { visibility: 'private' },
      '2'
    );
    const res = createMockResponse();

    mockLeaveProjectService.mockResolvedValue('NOT_FOUND');

    await leaveProjectController(req as any, res as any);

    expect(mockLeaveProjectService).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      error: 'Project not found or you are not a member of this project',
      data: null,
    });
  });

  it('should return 403 when project owner tries to leave', async () => {
    const req = createMockRequest(
      { id: '1' },
      { visibility: 'private' },
      '2'
    );
    const res = createMockResponse();

    mockLeaveProjectService.mockResolvedValue('FORBIDDEN');

    await leaveProjectController(req as any, res as any);

    expect(mockLeaveProjectService).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 403,
      error: 'Project owners cannot leave their own projects',
      data: null,
    });
  });

  it('should return 500 for internal server error', async () => {
    const req = createMockRequest(
      { id: '1' },
      { visibility: 'private' },
      '2'
    );
    const res = createMockResponse();

    mockLeaveProjectService.mockResolvedValue('INTERNAL_ERROR');

    await leaveProjectController(req as any, res as any);

    expect(mockLeaveProjectService).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      error: 'Internal Server Error',
      data: null,
    });
  });
});