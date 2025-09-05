import type { ProjectWithFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleProject = prisma.projects.findMany({
  include: {
    _count: { select: { projectFollowings: true } },
    mediums: { select: { label: true, mediumId: true } },
    tags: { select: { label: true, tagId: true, type: true } },
    projectImages: true,
    projectSocials: { include: { socials: true } },
    jobs: true,
    members: true,
    users: true,
  },
});

type ProjectsGetPayload = Awaited<typeof sampleProject>[number];

//map to shared type
export const transformProject = (project: ProjectsGetPayload): ProjectWithFollowers => {
  return {
    projectId: project.projectId,
    title: project.title,
    hook: project.hook,
    description: project.description,
    thumbnail: project.thumbnail,
    purpose: project.purpose,
    status: project.status,
    audience: project.audience,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    mediums: project.mediums.map((medium) => ({
      mediumId: medium.mediumId,
      label: medium.label,
    })),
    tags: project.tags.map((tag) => ({
      tagId: tag.tagId,
      type: tag.type,
      label: tag.label,
    })),
    projectImages: project.projectImages.map((img) => ({
      imageId: img.imageId,
      image: img.image,
      altText: '',
    })),
    projectSocials: project.projectSocials.map((social) => ({
      websiteId: social.websiteId,
      label: social.socials.label,
    })),
    jobs: project.jobs.map((job) => ({
      ...job,
      description: job.description ?? undefined,
    })),
    members: project.members.map((member) => ({
      projectId: member.projectId,
      userId: member.userId,
      roleId: member.roleId,
      permission: 0,
    })),
    followers: {
      count: project._count.projectFollowings,
    },
  };
};
