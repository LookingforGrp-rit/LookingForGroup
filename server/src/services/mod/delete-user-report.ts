import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE api/mod/user-report/{id}
const deleteUserReportService = async (
  reportId: number,
): Promise<DeleteServiceSuccess | DeleteServiceError> => {
  try {
    const report = await prisma.reportUser.findUnique({
      where: {
        reportId,
      },
    });

    if (!report) return 'NOT_FOUND';

    await prisma.reportUser.delete({
      where: {
        reportId,
      },
    });

    return 'NO_CONTENT';
  } catch (e) {
    console.error(`Error in deleteUserReportService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default deleteUserReportService;
