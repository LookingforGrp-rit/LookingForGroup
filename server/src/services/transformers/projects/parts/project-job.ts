import type { ProjectJob } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectJobSelector } from '#services/selectors/projects/parts/project-job.ts';
import { transformRole } from '#services/transformers/datasets/role.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleMedium = prisma.jobs.findMany({
  select: ProjectJobSelector,
});

type ProjectJobGetPayload = Awaited<typeof sampleMedium>[number];

//map to shared type
export const transformProjectJob = (
  projectId: number,
  {
    availability,
    compensation,
    contact: { users },
    createdAt,
    description,
    duration,
    jobId,
    location,
    roles,
    updatedAt,
  }: ProjectJobGetPayload,
): ProjectJob => {
  return {
    availability,
    compensation,
    createdAt,
    description,
    contact: transformUserToPreview(users),
    duration,
    jobId,
    location,
    role: transformRole(roles),
    updatedAt,
    apiUrl: `/api/projects/${projectId.toString()}/jobs/${jobId.toString()}`,
  };
};
