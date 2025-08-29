import prisma from '#config/prisma.ts';

export const deleteProjectService = async (projectId: number): Promise<string> => {
  try {
    const exists = await prisma.projects.findUnique({
      where: { projectId: projectId },
    });

    if (!exists) return 'NOT_FOUND';

    await Promise.all([
      prisma.members.deleteMany({ where: { projectId } }),
      prisma.projectGenres.deleteMany({ where: { projectId } }),
      prisma.projectTags.deleteMany({ where: { projectId } }),
      prisma.projectFollowings.deleteMany({ where: { projectId } }),
      prisma.projectImages.deleteMany({ where: { projectId } }),
      prisma.projects.delete({ where: { projectId } }),
    ]);

    return '';
  } catch (e) {
    console.error(`Error in deleteUserService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
