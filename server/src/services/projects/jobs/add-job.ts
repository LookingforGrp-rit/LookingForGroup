import type {
  ProjectJob,
  JobAvailability,
  JobDuration,
  JobLocation,
  JobCompensation,
} from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectJobSelector } from '#services/selectors/projects/parts/project-job.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectJob } from '#services/transformers/projects/parts/project-job.ts';

type AddJobServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export type JobInput = {
  roleId: number;
  contactUserId: number;
  availability: JobAvailability;
  duration: JobDuration;
  location: JobLocation;
  compensation: JobCompensation;
  description: string;
};

const addJobService = async (
  projectId: number,
  data: JobInput,
): Promise<ProjectJob | AddJobServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
    });

    if (!project) {
      return 'NOT_FOUND';
    }

    const contactUser = await prisma.users.findUnique({
      where: { userId: data.contactUserId },
    });

    if (!contactUser) {
      return 'NOT_FOUND';
    }

    const job = await prisma.jobs.create({
      data: {
        projectId,
        roleId: data.roleId,
        contactUserId: data.contactUserId,
        availability: data.availability,
        duration: data.duration,
        location: data.location,
        compensation: data.compensation,
        description: data.description,
      },
      select: ProjectJobSelector,
    });

    return transformProjectJob(projectId, job);
  } catch (error) {
    console.error('Error in addJobService:', error);
    return 'INTERNAL_ERROR';
  }
};

export type AddJobServiceResult = Awaited<ReturnType<typeof addJobService>>;
export default addJobService;
