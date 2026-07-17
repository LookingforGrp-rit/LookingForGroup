import type { UserReport } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserReportSelector } from '#services/selectors/mod/user-report.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUserReport = prisma.reportUser.findMany({
  select: UserReportSelector,
});

type UserReportGetPayload = Awaited<typeof sampleUserReport>[number];

//map to shared type
export const transformUserReport = ({
  reportId,
  reporterId,
  reportedId,
  reportText,
  active,
}: UserReportGetPayload): UserReport => {
  return {
    apiUrl: `api/mod/user-report/${reportId}`,
    reportId,
    reportedId,
    reporterId,
    reason: reportText,
    active,
  };
};
