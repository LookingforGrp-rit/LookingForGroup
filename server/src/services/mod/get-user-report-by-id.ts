import type { UserReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserReportSelector } from '#services/selectors/mod/user-report.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserReport } from '#services/transformers/mod/user-report.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/mod/user-report/{id}
const getUserReportByIdService = async (
  reportId: number,
): Promise<UserReport | GetServiceError> => {
  try {
    const reports = await prisma.reportUser.findUnique({
      where: {
        reportId,
      },
      select: UserReportSelector,
    });

    if (!reports) return 'NOT_FOUND';

    const transformedReports = transformUserReport(reports);

    return transformedReports;
  } catch (e) {
    console.error(`Error in getUserReportByIdService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getUserReportByIdService;
