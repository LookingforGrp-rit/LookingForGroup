import prisma from '#config/prisma.ts';
import { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DemoteModServiceError = ServiceErrorSubset<
  'INTERNAL_ERROR' | 'CONFLICT' | 'FORBIDDEN' | 'NOT_FOUND'
>;
type DemoteModServiceSuccess = ServiceSuccessSubset<'OK'>;

export const demoteModService = async (
  userId: number,
): Promise<DemoteModServiceError | DemoteModServiceSuccess> => {
  try {
    const result = await prisma.users.findFirst({
      where: { userId },
      select: { accessLevel: true },
    });

    if (!result) {
      return 'NOT_FOUND';
    }

    if (result.accessLevel === 'User') {
      // User cannot be demoted further
      return 'CONFLICT';
    }

    if (result.accessLevel === 'Administrator') {
      // Admin cannot be demoted
      return 'FORBIDDEN';
    }

    await prisma.users.update({
      where: { userId },
      data: { accessLevel: 'User' },
    });

    return 'OK';
  } catch (e) {
    console.error('There was an error is promoteUserToModService: ', e);
    return 'INTERNAL_ERROR';
  }
};
