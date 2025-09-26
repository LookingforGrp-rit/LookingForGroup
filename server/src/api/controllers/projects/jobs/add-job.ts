// import type { ApiResponse } from '@looking-for-group/shared';
// import type { Request, Response } from 'express';
// import type { PrismaClient } from '@prisma/client';
// import addJobService from '#services/projects/jobs/add-job.ts';

// const validAvailabilities = ['FullTime', 'PartTime', 'Flexible'] as const;
// const validDurations = ['ShortTerm', 'LongTerm'] as const;
// const validLocations = ['OnSite', 'Remote', 'Hybrid'] as const;
// const validCompensations = ['Unpaid', 'Paid'] as const;

// export type JobAvailability = typeof validAvailabilities[number];
// export type JobDuration = typeof validDurations[number];
// export type JobLocation = typeof validLocations[number];
// export type JobCompensation = typeof validCompensations[number];

// export interface AddJobBody {
//   roleId: number;
//   availability: JobAvailability;
//   duration: JobDuration;
//   location: JobLocation;
//   compensation: JobCompensation;
//   description: string;
// }

// type RequestBody = {
//   roleId: unknown;
//   availability: unknown;
//   duration: unknown;
//   location: unknown;
//   compensation: unknown;
//   description: unknown;
// };

// type Job = Awaited<ReturnType<PrismaClient['jobs']['create']>>;
// type ServiceResult = Job | 'INTERNAL_ERROR' | 'NOT_FOUND';

// const validateEnum = <T extends string>(value: unknown, validValues: readonly T[]): value is T => {
//   return typeof value === 'string' && validValues.includes(value as T);
// };

// const validateJobData = (data: RequestBody): data is AddJobBody => {
//   if (!data || typeof data !== 'object') return false;

//   return (
//     typeof data.roleId === 'number' &&
//     validateEnum(data.availability, validAvailabilities) &&
//     validateEnum(data.duration, validDurations) &&
//     validateEnum(data.location, validLocations) &&
//     validateEnum(data.compensation, validCompensations) &&
//     typeof data.description === 'string'
//   );
// };

// const addJobController = async (req: Request<{ id: string }>, res: Response) => {
//   const projectId = parseInt(req.params.id);

//   if (!projectId || isNaN(projectId)) {
//     const resBody: ApiResponse = {
//       status: 400,
//       error: 'Invalid project ID',
//       data: null,
//     };
//     res.status(400).json(resBody);
//     return;
//   }

//   const data = req.body as RequestBody;

//   if (!validateJobData(data)) {
//     const resBody: ApiResponse = {
//       status: 400,
//       error: 'Missing or invalid required fields',
//       data: null,
//     };
//     res.status(400).json(resBody);
//     return;
//   }

//   const result = await addJobService(projectId, data);

//   if (result === 'INTERNAL_ERROR') {
//     const resBody: ApiResponse = {
//       status: 500,
//       error: 'Internal Server Error',
//       data: null,
//     };
//     res.status(500).json(resBody);
//     return;
//   }

//   if (result === 'NOT_FOUND') {
//     const resBody: ApiResponse = {
//       status: 404,
//       error: 'Project not found',
//       data: null,
//     };
//     res.status(404).json(resBody);
//     return;
//   }
//   const resBody: ApiResponse<Job> = {
//     status: 201,
//     error: null,
//     data: result,
//   };
//   };
//   res.status(201).json(resBody);
// };

// export default addJobController;
