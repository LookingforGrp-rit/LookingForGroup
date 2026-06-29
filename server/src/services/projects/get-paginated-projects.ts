import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';
import getProjectByIdService from './get-proj-id.ts';
import getProjectsService from './get-projects.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/projects/:id
const getPaginatedProjectsService = async (
  count: number,
  lastProjectId: number,
): Promise<ProjectPreview[] | GetServiceError> => {
  try {
    //There should be a better way of doing this
    const projectCount = await prisma.projects.count();
    const projects = await getProjectsService();
    const lastProject = await getProjectByIdService(lastProjectId);
    const lastProjectIndex = projects.indexOf(lastProject as string & ProjectPreview);
    const remainingProjects = projectCount - 1 - lastProjectIndex;

    if (count >= remainingProjects) {
      count = remainingProjects;
    }

    const query = {
      select: ProjectPreviewSelector,
      take: count,
      orderBy: {
        createdAt: 'desc' as const,
      },
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
    let transformedProjects = result.map(transformProjectToPreview);

    //Array is alphabetized by project title
    transformedProjects = transformedProjects.toSorted(
      (project1, project2) => project1.title.charCodeAt(0) - project2.title.charCodeAt(0),
    );

    return transformedProjects;
  } catch (e) {
    console.error(`Error in getPaginatedProjectsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getPaginatedProjectsService;
