import type {
  ApiResponse,
  JobAvailability,
  JobCompensation,
  JobDuration,
  JobLocation,
  ProjectJob,
} from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import updateJobService from '#services/projects/jobs/update-job.ts';

const updateJobController = async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id);
  const jobId = parseInt(req.params.jobId);

  if (isNaN(projectId) || isNaN(jobId)) {
    const resBody: ApiResponse<ProjectJob> = {
      status: 400,
      error: 'Invalid project ID or job ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  // Parse and validate the request body
  const body = req.body as Partial<{
    roleId: number;
    availability: JobAvailability;
    duration: JobDuration;
    location: JobLocation;
    compensation: JobCompensation;
    description: string;
  }>;

  // Build the updates object with type safety
  const updates: Prisma.JobsUpdateInput = {};

  if (typeof body.roleId === 'number') {
    updates.roles = { connect: { roleId: body.roleId } };
  }

  if (body.availability && ['FullTime', 'PartTime', 'Flexible'].includes(body.availability)) {
    updates.availability = body.availability;
  }

  if (body.duration && ['ShortTerm', 'LongTerm'].includes(body.duration)) {
    updates.duration = body.duration;
  }

  if (body.location && ['OnSite', 'Remote', 'Hybrid'].includes(body.location)) {
    updates.location = body.location;
  }

  if (body.compensation && ['Unpaid', 'Paid'].includes(body.compensation)) {
    updates.compensation = body.compensation;
  }

  if (typeof body.description === 'string') {
    updates.description = body.description;
  }

  if (Object.keys(updates).length === 0) {
    const resBody: ApiResponse<ProjectJob> = {
      status: 400,
      error: 'No valid updates provided',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await updateJobService(projectId, jobId, updates);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse<ProjectJob> = {
      status: 404,
      error: 'Job not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse<ProjectJob> = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<ProjectJob> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default updateJobController;
