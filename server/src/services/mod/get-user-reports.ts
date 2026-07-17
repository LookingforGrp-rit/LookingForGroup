import type { UserReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserReportSelector } from '#services/selectors/mod/user-report.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserReport } from '#services/transformers/mod/user-report.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/mod/user-report
const getUserReportsService = async (): Promise<UserReport[] | GetServiceError> => {
  try {
    const reports = await prisma.reportUser.findMany({
      orderBy: {
        //Ascending order of IDs means oldest first
        reportId: 'asc',
      },
      select: UserReportSelector,
    });

    if (reports.length === 0) return 'NOT_FOUND';

    const transformedReports = reports.map((r) => transformUserReport(r));

    return transformedReports;
  } catch (e) {
    console.error(`Error in getUserReportsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getUserReportsService;
