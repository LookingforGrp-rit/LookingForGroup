import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type DeleteProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const deleteProjectService = async (
  projectId: number,
): Promise<ReturnType<typeof prisma.projects.delete> | DeleteProjectServiceError> => {
  try {
    const exists = await prisma.projects.findUnique({
      where: { projectId: projectId },
    });

    if (!exists) return 'NOT_FOUND';

    const deletedProject = await prisma.projects.delete({ where: { projectId: projectId } });
    await Promise.all([
      prisma.members.deleteMany({ where: { projectId: projectId } }),
      prisma.projectGenres.deleteMany({ where: { projectId: projectId } }),
      prisma.projectTags.deleteMany({ where: { projectId: projectId } }),
      prisma.projectFollowings.deleteMany({ where: { projectId: projectId } }),
      prisma.projectImages.deleteMany({ where: { projectId: projectId } }),
    ]);

    return deletedProject;
  } catch (e) {
    console.error(`Error in deleteProjectService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
