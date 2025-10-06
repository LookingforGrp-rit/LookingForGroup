import type { MyMajor, AddUserMajorInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MyMajorSelector } from '#services/selectors/me/parts/my-major.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMyMajor } from '#services/transformers/me/parts/my-major.ts';

type AddUserMajorServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type MajorWithUserId = AddUserMajorInput & { userId: number };

const addUserMajorService = async (
  data: MajorWithUserId,
): Promise<MyMajor[] | AddUserMajorServiceError> => {
  try {
    //creates the major
    const result = await prisma.users.update({
      where: {
        userId: data.userId,
      },
      data: {
        majors: {
          connect: { majorId: data.majorId },
        },
      },
      include: {
        majors: {
          where: data,
          select: MyMajorSelector,
        },
      },
    });

    return result.majors.map((major) => transformMyMajor(major));
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }

      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in addMajorService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addUserMajorService;
