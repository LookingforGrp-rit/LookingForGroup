import type { ProjectReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectReportSelector } from '#services/selectors/mod/project-report.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleProjectReport = prisma.reportProject.findMany({
  select: ProjectReportSelector,
});

type ProjectReportGetPayload = Awaited<typeof sampleProjectReport>[number];

//map to shared type
export const transformProjectReport = ({
  reportId,
  userId,
  projectId,
  reportText,
}: ProjectReportGetPayload): ProjectReport => {
  return {
    apiUrl: `api/mod/project-report/${reportId}`,
    reportId,
    userId,
    projectId,
    reason: reportText,
  };
};
