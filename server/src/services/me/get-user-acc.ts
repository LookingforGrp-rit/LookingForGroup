import type { MePrivate } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//can show sensitive data
export const getUserAccountService = async (
  userId: number,
): Promise<MePrivate | GetUserServiceError> => {
  try {
    const user = await prisma.users.findUnique({
      where: { userId },
      select: MePrivateSelector,
    });

    if (!user) return 'NOT_FOUND';

    return transformMeToPrivate(user);
  } catch (e) {
    console.error('Error in getUserByIdService:', e);
    return 'INTERNAL_ERROR';
  }
};
