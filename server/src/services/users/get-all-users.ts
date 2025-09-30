import type { UserDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserDetailSelector } from '#services/selectors/users/user-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToDetail } from '../transformers/users/user-detail.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getAllUsersService = async (): Promise<UserDetail[] | GetUserServiceError> => {
  try {
    //TODO: add filters
    //SKILLS - should look for users that have one or more skills
    //(maybe there should be an all/any toggle? like if you want to find users with any or all of the skills you select?)

    //MENTOR/DESIGNER/DEVELOPER - should look for users that are mentors/designers/developers

    //MAJORS - should look for users that have one or more majors
    //(users can have multiple majors, but realistically you'd put a bunch of majors and find people that have one of them)
    //(no shot you're looking for a single person who majored in game design AND new media AND music AND math AND computer science that'd be lunacy

    //ACADEMIC YEAR - should look for users in certain years

    //SOCIALS? SURE WHY NOT - should look for users with specific socials
    const users = await prisma.users.findMany({
      //where: { visibility: 1 },
      orderBy: { createdAt: 'desc' },
      select: UserDetailSelector,
    });

    //return the transformed users
    const transformedUsers = users.map(transformUserToDetail);
    return transformedUsers;
  } catch (error) {
    console.error('Error in getAllUsersService:', error);
    return 'INTERNAL_ERROR';
  }
};
