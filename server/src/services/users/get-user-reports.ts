import prisma from '#config/prisma.ts';
import type { ReportUser } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/mod/user-report
const getUserReportsService = async (): Promise<ReportUser[] | GetServiceError> => {
  try {
    const reports = await prisma.reportUser.findMany({
      orderBy: {
        //Ascending order of IDs means oldest first
        reportId: 'asc',
      },
    });

    if (reports.length === 0) return 'NOT_FOUND';

    return reports;
  } catch (e) {
    console.error(`Error in getUserReportsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getUserReportsService;
