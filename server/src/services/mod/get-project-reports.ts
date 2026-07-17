import type { ProjectReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectReportSelector } from '#services/selectors/mod/project-report.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectReport } from '#services/transformers/mod/project-report.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/mod/project-report
const getProjectReportsService = async (): Promise<ProjectReport[] | GetServiceError> => {
  try {
    const reports = await prisma.reportProject.findMany({
      orderBy: {
        //Ascending order of IDs means oldest first
        reportId: 'asc',
      },
      select: ProjectReportSelector,
    });

    if (reports.length === 0) return 'NOT_FOUND';

    const transformedReports = reports.map((r) => transformProjectReport(r));

    return transformedReports;
  } catch (e) {
    console.error(`Error in getProjectReportsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectReportsService;
