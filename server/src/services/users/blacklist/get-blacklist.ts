import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';
import type { UserPreview } from '@looking-for-group/shared';
import { getUserByIdService } from '../get-user/get-by-id.ts';

type GetBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//Gets the blacklist and returns it as a 
export const getBlacklistedUsersService = async () => {
    try {
        const blacklist = await prisma.userBlacklist.findMany();
        
        //This is supposed to be user.userId but it's not in the schema.prisma for some reason
        // let userIdsToUsers = blacklist.map((user) => getUserByIdService(user.googleId));
        // let transformedBlacklist = userIdsToUsers.map(transformUserToPreview);

        //

        //return transformedBlacklist;
    } catch (e) {
        console.error('Error in addBlacklistService:', e);
        return 'INTERNAL_ERROR';
    }
}
