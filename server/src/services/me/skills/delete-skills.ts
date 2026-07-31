import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import { getSkillsService } from './get-skills.ts';

type DeleteSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteSkillServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE api/me/skills/{id}
export const deleteSkillService = async (
  skillId: number,
  userId: number,
): Promise<DeleteSkillServiceError | DeleteSkillServiceSuccess> => {
  try {
    await prisma.userSkills.delete({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });

    const skills = await getSkillsService(userId);

    if (skills === 'INTERNAL_ERROR' || skills === 'NOT_FOUND') {
      return skills;
    }

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteSkillsService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
