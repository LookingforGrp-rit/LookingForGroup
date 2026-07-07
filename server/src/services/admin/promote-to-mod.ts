import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type PromoteUserToModServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT' | 'NOT_FOUND'>;
type PromoteUserToModServiceSuccess = ServiceSuccessSubset<'OK'>;

export const promoteUserToModService = async (
  userId: number,
): Promise<PromoteUserToModServiceError | PromoteUserToModServiceSuccess> => {
  try {
    const result = await prisma.users.findFirst({
      where: { userId },
      select: { accessLevel: true },
    });

    if (!result) {
      return 'NOT_FOUND';
    }

    if (result.accessLevel === 'Moderator' || result.accessLevel === 'Administrator') {
      // User already has mod perms!
      return 'CONFLICT';
    }

    await prisma.users.update({
      where: { userId },
      data: { accessLevel: 'Moderator' },
    });

    return 'OK';
  } catch (e) {
    console.error('There was an error is promoteUserToModService: ', e);
    return 'INTERNAL_ERROR';
  }
};
