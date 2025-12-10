import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteProjectServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//DELETE api/projects/{id}
export const deleteProjectService = async (
  projectId: number,
): Promise<DeleteProjectServiceSuccess | DeleteProjectServiceError> => {
  try {
    const exists = await prisma.projects.findUnique({
      where: { projectId: projectId },
    });

    if (!exists) return 'NOT_FOUND';

    await prisma.projects.delete({ where: { projectId: projectId } });
    await Promise.all([
      prisma.jobs.deleteMany({ where: { projectId } }),
      prisma.members.deleteMany({ where: { projectId: projectId } }),
      prisma.projectFollowings.deleteMany({ where: { projectId: projectId } }),
      prisma.projectImages.deleteMany({ where: { projectId: projectId } }),
    ]);

    return 'NO_CONTENT';
  } catch (e) {
    console.error(`Error in deleteProjectService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
