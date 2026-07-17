import type { MyMajor } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MyMajorSelector } from '#services/selectors/me/parts/my-major.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMyMajor } from '#services/transformers/me/parts/my-major.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/me/majors
//get a user's majors
const getUserMajorsService = async (userId: number): Promise<MyMajor[] | GetServiceError> => {
  try {
    const result = await prisma.users.findUnique({
      where: { userId },
      include: {
        majors: {
          select: MyMajorSelector,
          orderBy: {
            label: 'asc',
          },
        },
      },
    });

    if (result === null) return 'NOT_FOUND';

    //Array is alphabetized by major name
    result.majors = result.majors.toSorted(
      (major1, major2) => major1.label.charCodeAt(0) - major2.label.charCodeAt(0),
    );
    return result.majors.map((major) => transformMyMajor(major));
  } catch (e) {
    console.error(`Error in getMajorService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getUserMajorsService;
