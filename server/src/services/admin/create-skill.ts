import type { CreateSkillInput, Skill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type CreateSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT'>;

export const createSkillService = async (
  input: CreateSkillInput,
): Promise<Skill | CreateSkillServiceError> => {
  try {
    const result = await prisma.skills.create({
      data: {
        label: input.label,
        type: input.type,
        category: input.category,
      },
    });

    return result as Skill;
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'P2002') {
      return 'CONFLICT';
    }

    console.error('There was an internal error in createSkillService: ', e);
    return 'INTERNAL_ERROR';
  }
};
