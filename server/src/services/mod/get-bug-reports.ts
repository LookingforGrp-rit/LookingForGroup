import type { BugReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { BugReportSelector } from '#services/selectors/mod/bug-report.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformBugReport } from '#services/transformers/mod/bug-report.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/mod/bug-reports
//Gets bug reports
const getBugReportsService = async (): Promise<BugReport[] | GetServiceError> => {
  try {
    const reports = await prisma.reportBug.findMany({
      orderBy: {
        //Ascending order of IDs means oldest first
        reportId: 'asc',
      },
      select: BugReportSelector,
    });

    if (reports.length === 0) return 'NOT_FOUND';

    const transformedReports: BugReport[] = reports.map((r) => transformBugReport(r));

    return transformedReports;
  } catch (e) {
    console.error(`Error in getBugReportsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getBugReportsService;
