import type { UserPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get user by email
export const getUserByEmailService = async (
  ritEmail: string,
): Promise<UserPreview | GetUserServiceError> => {
  try {
    //should be unique
    const user = await prisma.users.findFirst({
      where: { ritEmail },
      select: UserPreviewSelector,
    });

    if (!user) return 'NOT_FOUND';

    //return the transformed user
    return transformUserToPreview(user);
  } catch (e) {
    console.error(`Error in getUserByUsernameService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
