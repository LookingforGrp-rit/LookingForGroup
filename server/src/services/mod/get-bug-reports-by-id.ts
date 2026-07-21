import type { BugReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/mod/bug-reports/{reportId}
//Gets a bug report
const getBugReportByIdService = async (reportId: number): Promise<BugReport | GetServiceError> => {
  try {
    const report = await prisma.reportBug.findFirst({
      where: {
        reportId,
      },
    });

    if (!report) return 'NOT_FOUND';

    const transformedReport: BugReport = {
      apiUrl: `api/mod/bug-report/${report.reportId.toString()}`,
      ...report,
    };

    return transformedReport;
  } catch (e) {
    console.error(`Error in getBugReportByIdService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getBugReportByIdService;
