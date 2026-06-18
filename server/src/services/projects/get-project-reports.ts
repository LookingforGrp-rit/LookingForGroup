import prisma from '#config/prisma.ts';
import type { ReportProject } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/mod/project-report
const getProjectReportsService = async (): Promise<ReportProject[] | GetServiceError> => {
  try {
    const reports = await prisma.reportProject.findMany({
      orderBy: {
        //Ascending order of IDs means oldest first
        reportId: 'asc',
      },
    });

    if (reports.length === 0) return 'NOT_FOUND';

    return reports;
  } catch (e) {
    console.error(`Error in getProjectReportsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectReportsService;
