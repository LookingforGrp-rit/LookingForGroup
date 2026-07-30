import type { BugReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { BugReportSelector } from '#services/selectors/mod/bug-report.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformBugReport } from '#services/transformers/mod/bug-report.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/mod/bug-reports/{reportId}
//Gets a bug report
const getBugReportByIdService = async (reportId: number): Promise<BugReport | GetServiceError> => {
  try {
    const report = await prisma.reportBug.findFirst({
      where: {
        reportId,
      },
      select: BugReportSelector,
    });

    if (!report) return 'NOT_FOUND';

    const transformedReport: BugReport = transformBugReport(report);

    return transformedReport;
  } catch (e) {
    console.error(`Error in getBugReportByIdService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getBugReportByIdService;
