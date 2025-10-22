import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetProjectsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getMyProjectsService = async (
  userId: number,
  visibility?: 'all' | 'public' | 'private',
  owner?: string,
): Promise<ProjectPreview[] | GetProjectsError> => {
  try {
    //all the projects they own
    const allOwnedProjects = await prisma.projects.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        title: 'asc',
      },
      select: ProjectPreviewSelector,
    });
    //all the projects they're a member of
    const allMemberProjects = await prisma.projects.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      select: ProjectPreviewSelector,
    });

    //all the projects
    //this is now a union instead of a concat (should've always been a union)
    //because since owners are also members of their own projects, projects they owned would come up twice
    //no longer
    let projects = [...new Set([...allOwnedProjects, ...allMemberProjects])];

    if (owner === 'me') {
      projects = allOwnedProjects;
    }

    if (visibility !== 'all') {
      //all the projects they're a member of filtered based on what they're visibly a member of
      const visibilityMemberProjects = await prisma.projects.findMany({
        where: {
          members: {
            some: {
              userId,
              profileVisibility: visibility,
            },
          },
        },
        orderBy: {
          title: 'asc',
        },
        select: ProjectPreviewSelector,
      });
      //all the projects they own filtered based on what's visible
      const visibilityOwnedProjects = await prisma.projects.findMany({
        where: {
          userId: userId,
          members: {
            some: {
              userId,
              profileVisibility: visibility,
            },
          },
        },
        orderBy: {
          title: 'asc',
        },
        select: ProjectPreviewSelector,
      });
      if (owner === 'all') {
        projects = [...new Set([...visibilityOwnedProjects, ...visibilityMemberProjects])];
      } else if (owner === 'me') {
        projects = visibilityOwnedProjects;
      }
    }

    //return not found if they don't have any
    if (projects.length === 0) return 'NOT_FOUND';

    //user helper to transform project
    const fullProject = projects.map(transformProjectToPreview);

    return fullProject;
  } catch (e) {
    console.error(`Error in getMyProjectsService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
