import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';
import type { UserPreview } from '@looking-for-group/shared';
import { getUserByIdService } from '../get-user/get-by-id.ts';
import { getUserByGoogleService } from "../../me/get-user-google.ts";
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';

type GetBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//Gets the blacklist and returns it as an array of UserPreviews
export const getBlacklistedUsersService = async () => {
    console.log("service function called");

    try {
        const blacklist = await prisma.userBlacklist.findMany();

        let allUsersInBlacklist = blacklist.map(async (user) => await prisma.users.findUnique({
            where: { googleId: user.googleId }
        }));

        // let transformedBlacklist = allUsersInBlacklist.map((user) => transformUserToPreview(user));

        //Alphabetize array by first name ascending
        // allUsersInBlacklist = allUsersInBlacklist.toSorted((user1, user2) =>
        //     user1.firstName.charCodeAt(0) - user2.firstName.charCodeAt(0));

        //For when preferredName is implemented
        // transformedBlacklist = transformedBlacklist.toSorted((user1, user2) =>
        //     user1.preferredName.charCodeAt(0) - user2.preferredName.charCodeAt(0));

        return allUsersInBlacklist;
    } catch (e) {
        console.error('Error in addBlacklistService:', e);
        return 'INTERNAL_ERROR';
    }
}
