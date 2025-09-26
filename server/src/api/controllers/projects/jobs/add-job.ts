import type {
  ApiResponse,
  JobAvailability,
  JobDuration,
  JobLocation,
  JobCompensation,
} from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import addJobService, { type JobInput } from '#services/projects/jobs/add-job.ts';

const validAvailabilities: JobAvailability[] = ['FullTime', 'PartTime', 'Flexible'];
const validDurations: JobDuration[] = ['ShortTerm', 'LongTerm'];
const validLocations: JobLocation[] = ['OnSite', 'Remote', 'Hybrid'];
const validCompensations: JobCompensation[] = ['Unpaid', 'Paid'];

const validateEnum = <T extends string>(value: unknown, validValues: readonly T[]): value is T => {
  return typeof value === 'string' && validValues.includes(value as T);
};

const validateJobData = (data: unknown): data is JobInput => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  return (
    typeof d.roleId === 'number' &&
    validateEnum(d.availability, validAvailabilities) &&
    validateEnum(d.duration, validDurations) &&
    validateEnum(d.location, validLocations) &&
    validateEnum(d.compensation, validCompensations) &&
    typeof d.description === 'string'
  );
};

const addJobController = async (req: Request<{ id: string }>, res: Response) => {
  const projectId = parseInt(req.params.id);

  if (!projectId || isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  if (!validateJobData(req.body)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing or invalid required fields',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await addJobService(projectId, req.body);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 201,
    error: null,
    data: result,
  };
  res.status(201).json(resBody);
};

export default addJobController;
