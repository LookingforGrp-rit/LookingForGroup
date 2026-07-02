import prisma from '#config/prisma.ts';
import { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;
type DeleteSkillServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

export const deleteSkillFromSiteService = async (
  skillId: number,
): Promise<DeleteSkillServiceSuccess | DeleteSkillServiceError> => {
  try {
    await prisma.skills.delete({
      where: { skillId },
    });

    return 'NO_CONTENT';
  } catch (e) {
    console.error('There was an internal error in deleteSkillFromSiteService: ', e);
    return 'INTERNAL_ERROR';
  }
};
