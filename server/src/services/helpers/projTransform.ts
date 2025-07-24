import type { ProjectWithFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleProject = prisma.projects.findMany({
  include: {
    _count: { select: { projectFollowings: true } },
    projectGenres: { include: { genres: true } },
    projectTags: { include: { tags: true } },
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
    userId: project.userId ?? 0,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    projectType: project.projectGenres.map((pg) => ({
      typeId: pg.typeId,
      label: pg.genres.label,
    })),
    projectTags: project.projectTags.map((pt) => ({
      projectId: pt.projectId,
      tagId: pt.tagId,
      position: pt.position,
      type: pt.tags.type,
      label: pt.tags.label,
    })),
    projectImages: project.projectImages.map((img) => ({
      imageId: img.imageId,
      image: img.image,
      altText: '',
    })),
    projectSocials: project.projectSocials.map((ps) => ({
      websiteId: ps.websiteId,
      label: ps.socials.label,
    })),
    jobs: project.jobs.map((job) => ({
      ...job,
      description: job.description ?? undefined,
    })),
    members: project.members.map((member) => ({
      projectId: member.projectId,
      userId: member.userId,
      titleId: member.titleId,
      permission: 0,
    })),
    followers: {
      count: project._count.projectFollowings,
    },
  };
};
