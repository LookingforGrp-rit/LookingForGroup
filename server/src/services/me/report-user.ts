import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT' | 'NOT_FOUND'>;
type GetServiceSuccess = ServiceSuccessSubset<'OK'>;

//POST api/me/users/report/{id}/{report}
export const reportUserService = async (
  reporterId: number,
  reportedId: number,
  reportText: string,
): Promise<GetServiceSuccess | GetServiceError> => {
  try {
    //Check if report already exists
    const report = await prisma.reportUser.findFirst({
      where: {
        reporterId,
        reportedId,
      },
    });
    if (report) return 'CONFLICT';

    //Create report
    await prisma.reportUser.create({
      data: {
        reporterId,
        reportedId,
        reportText,
      },
    });

    return 'OK';
  } catch (e) {
    console.error(`Error in reportUserService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};
