import type { UserAccessLevel } from '@looking-for-group/shared';
import { getUserAccessLevel } from '#services/authentication/get-user-access-level.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/admin/status/:id
export const getAccessLevelService = async (
  userId: number,
): Promise<UserAccessLevel | GetUserServiceError> => {
  try {
    const accessLevel = await getUserAccessLevel(userId);
    return accessLevel;
  } catch (e) {
    console.error('Error in getAccessLevelService:', e);
    return 'INTERNAL_ERROR';
  }
};
