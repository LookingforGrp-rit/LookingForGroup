import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/projects
const getProjectsService = async (): Promise<ProjectPreview[] | GetServiceError> => {
  try {
    const result = await prisma.projects.findMany({
      select: ProjectPreviewSelector,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        approved: true,
        globalVisibility: 'public',
      },
    });

    //return transformed projects
    let transformedProjects = result.map(transformProjectToPreview);

    //Array is alphabetized by project title
    transformedProjects = transformedProjects.toSorted(
      (project1, project2) => project1.title.charCodeAt(0) - project2.title.charCodeAt(0),
    );
    return transformedProjects;
  } catch (e) {
    console.error(`Error in getProjectsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectsService;
