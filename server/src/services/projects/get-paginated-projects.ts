import type { ProjectPreview, ProjectSortMethod } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
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

    //set up sorting option
    let orderByInput;
    switch (sortMethod) {
      case 'Newest':
        orderByInput = { createdAt: 'desc' as const };
        break;
      case 'A-Z':
        orderByInput = { title: 'asc' as const };
        break;
    }

    const query = {
      select: ProjectPreviewSelector,
      take: count,
      orderBy: orderByInput,
      where: {
        approved: true,
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
    const transformedProjects = result.map(transformProjectToPreview);

    //Array is alphabetized by project title
    // transformedProjects = transformedProjects.toSorted(
    //   (project1, project2) => project1.title.charCodeAt(0) - project2.title.charCodeAt(0),
    // );

    return transformedProjects;
  } catch (e) {
    console.error(`Error in getPaginatedProjectsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getPaginatedProjectsService;
