import type { MyMajor } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MyMajorSelector } from '#services/selectors/me/parts/my-major.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMyMajor } from '#services/transformers/me/parts/my-major.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getUserMajorsService = async (userId: number): Promise<MyMajor[] | GetServiceError> => {
  try {
    const result = await prisma.users.findUnique({
      where: { userId },
      include: {
        majors: {
          select: MyMajorSelector,
        },
      },
    });

    if (result === null) return 'NOT_FOUND';

    return result.majors.map((major) => transformMyMajor(major));
  } catch (e) {
    console.error(`Error in getMajorService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getUserMajorsService;
