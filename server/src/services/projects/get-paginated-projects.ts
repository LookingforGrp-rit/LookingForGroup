import type { ProjectPreview, ProjectSortMethod, Visibility } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectWithFollowersSelector } from '#services/selectors/projects/projects-with-followers.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/projects/:id
const getPaginatedProjectsService = async (
  count: number,
  lastProjectId: number,
  sortMethod: ProjectSortMethod,
): Promise<ProjectPreview[] | GetServiceError> => {
  try {
    //There should be a better way of doing this
    // const projectCount = await prisma.projects.count();
    // const projects = await getProjectsService();
    // const lastProject = await getProjectByIdService(lastProjectId);
    // const lastProjectIndex = projects.indexOf(lastProject as string & ProjectPreview);
    // const remainingProjects = projectCount - 1 - lastProjectIndex;

    // if (count >= remainingProjects) {
    //   count = remainingProjects;
    // }
    let orderByMethod;
    switch (sortMethod) {
      case 'A-Z':
        orderByMethod = { title: 'asc' as const };
        break;
      case 'Newest':
        orderByMethod = { createdAt: 'desc' as const };
        break;
      case 'Popular':
        orderByMethod = { projectFollowings: { _count: 'desc' as const } };
        break;
    }

    const query = {
      select: ProjectWithFollowersSelector,
      orderBy: orderByMethod,
      take: count,
      where: {
        approved: true,
        globalVisibility: 'public' as Visibility,
      },
      ...(lastProjectId
        ? {
            skip: 1,
            cursor: { projectId: lastProjectId },
          }
        : {}),
    };

    const result = await prisma.projects.findMany(query);

    //return transformed projects
    return result.map(transformProjectToPreview);
  } catch (e) {
    console.error(`Error in getPaginatedProjectsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getPaginatedProjectsService;
