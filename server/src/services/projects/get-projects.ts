import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/projects
/**
 * Service for getting all projects
 * @param lastProj
 * @param takeNum The number of projects to take, default is 5
 * @returns An array of projects
 */
const getProjectsService = async (
  lastProj: null | number = null,
  takeNum: number = 5,
): Promise<ProjectPreview[] | GetServiceError> => {
  try {
    let result;

    //Changed ternary to an if for readability
    if (lastProj) {
      result = await prisma.projects.findMany({
        select: ProjectPreviewSelector,
        take: takeNum,
        cursor: {
          projectId: lastProj,
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          approved: true,
        },
      });
    } else {
      result = await prisma.projects.findMany({
        select: ProjectPreviewSelector,
        take: takeNum,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          approved: true,
        },
      });
    }

    //return transformed projects
    let transformedProjects = result.map(transformProjectToPreview);

    //Array is alphabetized by project title
    transformedProjects = transformedProjects.toSorted(
      (project1, project2) => project1.title.charCodeAt(0) - project2.title.charCodeAt(0),
    );

    return transformedProjects;
  } catch (e) {
    console.error(`Error in getProjectsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectsService;
