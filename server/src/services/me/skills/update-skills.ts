import type { MySkill, UpdateUserSkillInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySkillSelector } from '#services/selectors/me/parts/my-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySkill } from '#services/transformers/me/parts/my-skill.ts';
import { getSkillsService } from './get-skills.ts';

type UpdateSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//PATCH api/me/skills/{id}
const updateSkillsService = async (
  userId: number,
  skillId: number,
  data: UpdateUserSkillInput,
): Promise<MySkill | UpdateSkillsServiceError> => {
  try {
    const skills = await getSkillsService(userId);

    if (skills === 'INTERNAL_ERROR' || skills === 'NOT_FOUND') {
      return skills;
    }

    const oldIndex = skills.findIndex((s) => s.skillId === skillId);
    if (oldIndex === -1) {
      return 'NOT_FOUND';
    }

    const [movedSkill] = skills.splice(oldIndex, 1);

    // insert at new position
    const targetIndex = data.position !== undefined ? data.position : oldIndex;

    skills.splice(targetIndex, 0, movedSkill);

    // update the moved skill with new proficiency and position
    const result = await prisma.userSkills.update({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
      data: {
        ...(data.proficiency !== undefined && { proficiency: data.proficiency }), //this is currently defaulting to novice, but it can handle different changes to it
        ...(data.position !== undefined && { position: data.position }),
      },
      select: MySkillSelector,
    });

    // renumber all skills
    for (const [index, s] of skills.entries()) {
      if (s.position !== index) {
        // update display order in db if it doesn't match the new order
        s.position = index;
        await prisma.userSkills.update({
          where: {
            userId_skillId: {
              userId,
              skillId: s.skillId,
            },
          },
          data: {
            position: index,
          },
        });
      }
    }

    return transformMySkill(result);
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }

      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in updateSkillsService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateSkillsService;
