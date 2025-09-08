import type { ProjectDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import { transformUserToPreview } from '../users/user-preview.ts';
import { transformProjectToPreview } from './project-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleProjectDetail = prisma.projects.findMany({
  select: ProjectDetailSelector,
});

type ProjectsGetPayload = Awaited<typeof sampleProjectDetail>[number];

//map to shared type
export const transformProjectToDetail = (project: ProjectsGetPayload): ProjectDetail => {
  return {
    ...transformProjectToPreview(project),
    description: project.description,
    purpose: project.purpose,
    status: project.status,
    audience: project.audience,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    owner: transformUserToPreview(project.users),
    tags: project.tags.map(({ tagId, label, type }) => ({
      tagId,
      label,
      type,
    })),
    projectImages: project.projectImages.map(({ imageId, image, altText }) => ({
      imageId,
      image,
      altText,
    })),
    projectSocials: project.projectSocials.map(({ websiteId, label, url }) => ({
      websiteId,
      label,
      url,
    })),
    jobs: project.jobs.map(
      ({
        availability,
        compensation,
        createdAt,
        description,
        duration,
        jobId,
        location,
        role: { roleId, label },
        updatedAt,
      }) => ({
        availability,
        compensation,
        createdAt,
        description: description ?? '',
        duration,
        jobId,
        location,
        role: {
          roleId,
          label,
        },
        updatedAt,
        apiUrl: `/api/projects/${project.projectId.toString()}/jobs/${jobId.toString()}`,
      }),
    ),
    members: project.members.map(({ createdAt, roles: { roleId, label }, users }) => ({
      memberSince: createdAt,
      role: {
        roleId,
        label,
      },
      user: transformUserToPreview(users),
      apiUrl: `/api/projects/${project.projectId.toString()}/members/${users.userId.toString()}`,
    })),
  };
};
