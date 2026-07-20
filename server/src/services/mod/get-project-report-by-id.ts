import type { ProjectReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectReportSelector } from '#services/selectors/mod/project-report.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectReport } from '#services/transformers/mod/project-report.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/mod/project-report/{id}
const getProjectReportByIdService = async (
  reportId: number,
): Promise<ProjectReport | GetServiceError> => {
  try {
    const report = await prisma.reportProject.findUnique({
      where: {
        reportId,
      },
      select: ProjectReportSelector,
    });

    if (!report) return 'NOT_FOUND';

    const transformedReport = transformProjectReport(report);

    return transformedReport;
  } catch (e) {
    console.error(`Error in getProjectReportByIdService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectReportByIdService;
